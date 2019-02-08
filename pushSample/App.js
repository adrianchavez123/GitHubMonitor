/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
const Buffer = require("buffer").Buffer;

import {Platform, StyleSheet, Text, View,Linking,ActivityIndicator} from 'react-native';
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogButton,
  ScaleAnimation,
  DialogFooter,
} from 'react-native-popup-dialog';

import {Header,Button,Overlay,PricingCard , Card} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FlatGrid } from 'react-native-super-grid';

import {Push} from 'bmd-push-react-native';
import { DeviceEventEmitter } from 'react-native';


type Props = {};

// Add Cloud functions Details
var owOptions = {
  apihost: 'Cloud functions api host',
  nameSpace:'Cloud functions nameSpace',
  api_key: 'Cloud functions ApiKey',
};

// Add Push service details
var pushValues = {
  appGUID: 'Push Service AppGUID',
  clientSecret: 'Push Service clientSecret',
  region: 'Push service region ', // Example ; For Us-South its ng.bluemix.net
}

// Add your target repo name

var repoName = "Gypsian";

export default class App extends Component<Props> {
  
  constructor(properties) {
    super(properties);

    this.state = {
      scaleAnimationDialog: false,
      notificationTitle:"New Notification",
      notificationSubTitle:"New sub Notification",
      notificationDetails:"no description",
      gitDataJson:[],
      gitDataNotEmpty: false,
      messsageJson:{},
      dialogOkayTitle:"OK",
      dialogCancelTitle:"CANCEL",
      isOverLayVisible:false,
      is_hud_visible: false,
      bellButtonColor: "#ecf0f1",
      isPushInitialised: false,
    };  

    this.owGetAllReposAction = this.owGetAllReposAction.bind(this);
    this.renderFlatList = this.renderFlatList.bind(this);
    this.renderEmptyList = this.renderEmptyList.bind(this);

    this.renderDialog = this.renderDialog.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderLeftComponent = this.renderLeftComponent.bind(this);
    this.renderCenterLable = this.renderCenterLable.bind(this);
    this.renderButtonIcon = this.renderButtonIcon.bind(this);

    this.renderSubList = this.renderSubList.bind(this);
    this.onPushInit = this.onPushInit.bind(this);
    this.onPushRegister = this.onPushRegister.bind(this);

    this.renderOverLay = this.renderOverLay.bind(this);
    this.renderDetails = this.renderDetails.bind(this);

    this.showHUID = this.showHUID.bind(this);
    this.renderPushButton = this.renderPushButton.bind(this);

  }

    //super(properties);
    

  async componentDidMount() {
    
    this.owGetAllReposAction();

    //Push init

    this.onPushInit();
  }


  onPushInit() {
    Push.init({
      "appGUID":pushValues.appGUID,
      "clientSecret":pushValues.clientSecret,
      "region":pushValues.region
    }).then((responseJson) => {

      this.setState({ 
        scaleAnimationDialog: true,
        notificationTitle: "Init Success",
        notificationSubTitle:"",
        notificationDetails:responseJson,
        dialogOkayTitle: "OK",
        dialogCancelTitle: "CANCEL",
        isPushInitialised: true,
      });

    }).catch((error) => {
      this.setState({ 
        scaleAnimationDialog: true,
        notificationTitle: "Init Error",
        notificationSubTitle:"",
        notificationDetails:error.toString(),
        dialogOkayTitle: "OK",
        dialogCancelTitle: "CANCEL",
      });
    });
  }

  onPushRegister() {
    
    if(this.state.isPushInitialised) {

      Push.register({}).then((response) => {

        this.setState({ 
          scaleAnimationDialog: true,
          notificationTitle: "Registration Success",
          notificationSubTitle:"",
          notificationDetails:response,
          dialogOkayTitle: "OK",
          dialogCancelTitle: "CANCEL",
          bellButtonColor: "#1abc9c",
        });
  
      }).catch((error) => {
        this.setState({ 
          scaleAnimationDialog: true,
          notificationTitle: "Registration Error",
          notificationSubTitle:"",
          notificationDetails:error.toString(),
          dialogOkayTitle: "OK",
          dialogCancelTitle: "CANCEL",
        });
      });
        
      DeviceEventEmitter.addListener("onPushReceived", function(notification: Event) { 
  
        var payload = JSON.parse(notification.payload);
        //alert(JSON.stringify(notification));
        //alert(payload);
        if(payload.kind === 'issue') {
          if(payload.state === 'closed') {
            payload.main = 'Issue is Closed'
          } else {
            payload.main = 'Issue Details'
          }
        } else if(payload.kind === 'pullRequest'){
  
          if(payload.state === 'closed') {
            payload.main = 'PullRequest is Closed'
          } else {
            payload.main = 'PullRequest Details'
          }
        }
        //alert(payload.main);
        this.setState({
          scaleAnimationDialog: true,
          notificationTitle: payload.main,
          notificationSubTitle:payload.title,
          notificationDetails:payload.body,
          dialogOkayTitle: "VIEW",
          dialogCancelTitle: "CANCEL",
          messsageJson: payload,
         });
      }.bind(this));
        
      Push.registerNotificationsCallback("onPushReceived");
      
    } else {
      this.setState({
        scaleAnimationDialog: true,
        notificationTitle: "Registration Error",
        notificationSubTitle:"",
        notificationDetails:"Push is not initialized",
        dialogOkayTitle: "OK",
        dialogCancelTitle: "CANCEL",
       });
    }
  }

  showHUID() {
      return (
        <ActivityIndicator size="large" color="#fff"/>          
      )
  }
  owGetAllReposAction() {

    
    this.setState({ gitDataJson: [], gitDataNotEmpty: false, is_hud_visible:true});
    const apiKeyBase64 = "Basic " + new Buffer(owOptions.api_key).toString('base64');
    const owUrl = "https://" + owOptions.apihost + "/api/v1/namespaces/" + owOptions.nameSpace + "/actions/getReposAction?blocking=true";

    fetch(owUrl, {
         method: 'POST',
         headers: {
          'Authorization': apiKeyBase64
        }
      })
      .then((response) => { return response.json()})
      .then((responseJson) => {
         this.setState({ gitDataJson: responseJson.response.result.message, gitDataNotEmpty: true, is_hud_visible:false});
      }).catch((error) => {
        this.setState({ 
          scaleAnimationDialog: true,
          notificationTitle: "Cloud Functions Error",
          notificationSubTitle:"",
          notificationDetails:error,
        });
      });
  }

  renderSubList(open_issues,forks_count,watchers_count,stargazers_count ) {

    var data = [
      {
        value:open_issues,
        icon:"exclamation-triangle",
        type:"font-awesome"
      },
      {
        value:forks_count,
        icon:"share-alt",
        type:"font-awesome"
      },
      {
        value:watchers_count,
        icon:"eye",
        type:"font-awesome"
      },
      {
        value:stargazers_count,
        icon:"star",
        type:"font-awesome"
      }
    ];
    return(
      <FlatGrid
        itemDimension={40}
        items={data}
        style={styles.gridView}
        listKey={(item, index) => 'D' + index.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.optionsContainer]}>
          <Icon
            name={item.icon}
            type={item.type}
            color='black'
            underlayColor={'#2089dc'}
            size={12}
            style={styles.iconStyleDD}
          />
          <Text style={styles.buttonText}>{item.value}</Text>
           
          </View>
        )}
      />
    );
  }

  renderFlatList() {

    return (
      <FlatGrid
        itemDimension={130}
        listKey={(item, index) => 'D' + index.toString()}
        items={this.state.gitDataJson}
        style={styles.gridView}
        renderItem={({ item, index }) => (
          <View style={[styles.itemContainer]}>
            <Text numberOfLines={1} style={styles.itemName}>{item.name}</Text>
            <Text numberOfLines={2} style={styles.itemCode}>{item.description}</Text>
            <View style={styles.optionsView}>
             {this.renderSubList(item.open_issues,item.forks_count,item.watchers_count,item.stargazers_count)}
            </View>
          </View>
        )}
      />
    );
  }

  renderPushButton() {

    return(
      <View  
      style= {styles.bellButton}
      >
      <Icon
        name='bell'
        type='font-awesome'
        // color='#ecf0f1'
        underlayColor={'#2089dc'}
        color={this.state.bellButtonColor}
        size={50}
        onPress={this.onPushRegister}
      />
      </View>
    );
  }
  renderDetails() {
    
    var stateStyle = this.state.messsageJson.state === "open" ? styles.stateGreenStyle : styles.stateRedStyle;
    var urlValue = this.state.messsageJson.url;
   return(
      <View>
         <Text numberOfLines={1} style={[styles.titleText, styles.titlePopUpText]}>{this.state.messsageJson.title} </Text>
         <Text numberOfLines={3} style={[styles.bodyPopUpText]} >{this.state.messsageJson.body} </Text>
         <Text style={[styles.stateStyle,stateStyle]}>{this.state.messsageJson.state}</Text>
         <Text numberOfLines={2} style={[styles.userNameStyle]}>Created by {this.state.messsageJson.userName} on {this.state.messsageJson.created_at}</Text>
         <View style={styles.detailsViewContainer}>
           <Text>Comments : {this.state.messsageJson.comments}</Text>
           <Text style={styles.detailsViewText}>assignees : {this.state.messsageJson.assignees}</Text>
         </View>
         <Button style={styles.openButtonStyle} title="View in Github"
                 onPress={() => {
                  Linking.openURL(urlValue);
                  this.setState({ isOverLayVisible: false });
                }}/>

      </View>
    );
  }
  renderOverLay() {
    return (
      <Overlay
        isVisible={this.state.isOverLayVisible}
        overlayBackgroundColor="white"
        height="auto"
        onBackdropPress={() => {
          this.setState({ isOverLayVisible: false });
        }}
      >
      {this.renderDetails()}
      </Overlay>
    );
  }
  renderEmptyList() {
    return (
      <Text style={styles.loadingText}> Fetching git details!.</Text>
    );
  }

  renderDialog() {

    return(

        
      <Dialog
      onTouchOutside={() => {
        this.setState({ scaleAnimationDialog: false });
      }}
      width={0.9}
      visible={this.state.scaleAnimationDialog}
      dialogAnimation={new ScaleAnimation()}
      footer={
        <DialogFooter>
          <DialogButton
            text={this.state.dialogCancelTitle}
            onPress={() => {
              this.setState({ scaleAnimationDialog: false });
            }}
          />
          <DialogButton
            text={this.state.dialogOkayTitle}
            onPress={() => {
              var ovlVisible = false
              if (this.state.dialogOkayTitle === 'VIEW') {
                ovlVisible = true
              }
              this.setState({ scaleAnimationDialog: false, isOverLayVisible:ovlVisible });
            }}
          />
        </DialogFooter>
      }
      dialogTitle={
        <DialogTitle 
          title={this.state.notificationTitle}
          hasTitleBar={false}
        />
      }
    >
      <DialogContent
        style={{
          backgroundColor: '#fff',
        }}
      >
        <Text>{this.state.notificationSubTitle}</Text>
        <Text>{this.state.notificationDetails}</Text>
      </DialogContent>
    </Dialog>
    );
  }

  renderLeftComponent() {
    return(
      <Text style={styles.leftText}>Total {this.state.gitDataJson.length}</Text>
    );
  }

  renderButtonIcon() {
    return(
      <Icon
        name='tasks'
        type='font-awesome'
        color='white'
        underlayColor={'#2089dc'}
        size={20}
        onPress={this.owGetAllReposAction}
      />
    );
  }

  renderCenterLable() {
    return(
      <Text style={[styles.titleText]}>{repoName}</Text>
    );
  }
  renderHeader() {

    return (
      <Header backgroundColor='#34495E' 
      leftComponent={this.renderLeftComponent()}
      centerComponent={this.renderCenterLable()}
      rightComponent={this.renderButtonIcon()}
      />
    );
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#34495E' }}>
      
      {this.renderHeader()}
      
      

     <View style={styles.container}>
     { this.state.is_hud_visible && this.showHUID()}
     { this.state.gitDataNotEmpty ? this.renderFlatList() : this.renderEmptyList()}        
      </View> 
      {this.renderDialog()} 
      {this.renderOverLay()}
      {this.renderPushButton()}
      
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#34495E',
  },

  gridView: {
    marginTop: 0,
    flex: 1,
  },

  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 5,
    padding: 10,
    height: 150,
    position: "relative",
    backgroundColor: '#F2F3F4',
    
  },

  optionsView: {
    flex:1,
  },
  optionsContainer: {
    borderRadius: 5,
    padding: 1,
    height: 20,
    position: "relative",
    backgroundColor: '#F2F3F4',
    flexDirection: 'row',
   
  },

  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
    paddingLeft:  10,
  },

  itemName: {
    marginTop:15,
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  itemCode: {
    marginTop:2,
    fontWeight: '600',
    fontSize: 12,
    color: '#333333',
  },

  titleText: {
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: "center",
    color: "#fff",
    marginTop: 15
  },

  titlePopUpText: {
    color: "#000",
  },

  bodyPopUpText: {
    color: "#000",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 5,
    marginTop: 8,
  },

  loadingText: {
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: "center",
    color: "#fff",
    marginBottom: 5
  },
  leftText: {
    color:'#fff',
    fontWeight: 'bold',
  },
  rightText:{
    fontWeight: 'bold',
  },
  iconStyleDD:{
    marginTop: 2,
  },
  cardStyle: {
    marginTop:0,
    marginLeft:0,
    marginRight: 0,
    marginBottom: 0,
    padding: 5,
  },
  stateStyle: {
    alignSelf: 'flex-end',
    marginTop: -5,
    paddingRight: 10,
    position: 'absolute',
    fontWeight: 'bold',
  },
  stateGreenStyle: {
    color: 'green',
  },
  stateRedStyle: {
    color: 'red',
  },
  userNameStyle: {
    marginTop: 10,
    textAlign: "center",
  },
  openButtonStyle:{
    marginTop: 10,
  },
  detailsViewContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center'
  },
  detailsViewText: {
    paddingLeft: 20
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    justifyContent: 'center'
  },

  bellButton:{
    backgroundColor: '#2c3e50',
    height:70,
    width:70,

    
    
    position: 'absolute',

    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    bottom: 25,
    right: 25,
    borderRadius:35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  }
});


