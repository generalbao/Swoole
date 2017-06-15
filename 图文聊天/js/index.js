var friendToken = '';
var msgArr = new Array();        //消息数组
var msgNum = 0;

var mytoken = sessionStorage.getItem('mytoken');
var myid = sessionStorage.getItem('myid');
var isRegister = null;
var url = "ws://192.168.28.133:9503"; //可以根据自己修改
if(mytoken){
     isRegister = true;
    var data  = {"action":"changeIdByToken","token":mytoken};
    register(JSON.stringify(data));    
  }else{
    isRegister = false;   
  }

console.log('is register'+isRegister);
document.onkeydown=function(event){
            var e = event || window.event || arguments.callee.caller.arguments[0];
            if(e && e.keyCode==27){ // 按 Esc 
                //要做的事情
              }
            if(e && e.keyCode==113){ // 按 F2 
                 //要做的事情
               }            
             if(e && e.keyCode==13){ // enter 键
                 sendOne();
            }
        }; 

      
      $(function(){

           if (isRegister) {
            $("#name").css('display','none');
            $("#register").css('display','none');
            $("#myself").html('myid is '+ myid + ' my token is ' + mytoken);
           }
         
         //一进来就请求在线数据
          var getOnlineData = {"action":"getOnlineData"};
          register(JSON.stringify(getOnlineData));

           $("#register").click(function(){
           var name = $("#name").val();
           //console.log(name);
           sessionStorage.setItem('name',name);
           var data  = {"action":"register","name":name};
           
           register(JSON.stringify(data));
            });

           $("#chgImg").click(function(){
           var formData = new FormData();
            var mytoken = sessionStorage.getItem("mytoken");
            formData.append("file",$("#img")[0].files[0]);
            formData.append("token",mytoken);
             
             $.ajax({
              url : 'php/upload.php', 
              type : 'POST', 
              data : formData, 
              // 告诉jQuery不要去处理发送的数据
              processData : false, 
              // 告诉jQuery不要去设置Content-Type请求头
              contentType : false,
              success : function(obj){
               console.log(obj);
               alert('修改图片成功');
              },
              error :function(obj){

              }
             });
           });

        });
 

       function register(data){
        var ws = new WebSocket(url);
          ws.onopen = function()
               {
                  // Web Socket 已连接上，使用 send() 方法发送数据
                  ws.send(data);
                  //console.log("数据发送中..."+data);
               };
        
               ws.onmessage = function (evt) 
               { 
                  //console.log(evt.data);
                  var received_msg = JSON.parse(evt.data);
                  var action = (received_msg.action);
                  // //console.log(received_msg + "---" + action);
                  
                  switch(action){
                    case 'register':
                  
                  sessionStorage.setItem("mytoken", received_msg.token);
                  sessionStorage.setItem("myid", received_msg.userid);
                  $("#name").css('display','none');
                  $("#register").css('display','none');
                  $("#myself").html('myid is '+ received_msg.userid + ' my token is ' + received_msg.token);
                  // sessionStorage.token=received_msg.token;
                    break;

                    case 'sendOne':
                      //console.log('sendOne');
                      break;
                    
                    //有人给我发信息
                    case 'acceptOne':
                    // //console.log('acceptOne');
                    // //console.log(received_msg);


                    //存放在数组
                    // var 'message_'+received_msg.fromID = new Array();

                    // $("#message").after('<div style="float:right">'+received_msg.fromID + "给你发了信息---" +  received_msg.content +'--' +received_msg.time+"</div><br/>");
                    // msgArr[received_msg.fromID]
                    

                    // friendID==received_msg.fromID

                    //console.log('chat with ' + friendToken + '---'+received_msg.fromID);
                    if (friendToken==received_msg.fromToken) {
                      $("span[class='msg_tail']:last").after(received_msg.content+"<span class='msg_tail'></span>");
                     
                     //console.log('has new message ');

                    }else{

                      $("#msg_tixing_"+received_msg.fromToken).html('<span class="msgNum">'+(++msgNum)+'</span>');
                    }


                     
                      break;


                    case 'onlineData':

                    // var myid = $("#myid").html();
                     var mytoken = sessionStorage.getItem("mytoken");
                    // //console.log(myid+' my id is');
                    // //console.log(received_msg.data+' xxxx');
                     var onlineData = JSON.parse(received_msg.data);
                  console.log(onlineData);
                  // return;
                  var onlineList = onlineData;
                  var onlineContent = '';
                  for(var i=0;i<onlineList.length;i++){
                      
                      //不能自己与自己聊天
                      if (onlineList[i]['token'] != mytoken) {
                       
                           onlineContent += '<button  onclick="showMessage('+"'"+ onlineList[i]['token']+"','"+ onlineList[i]['sex'] 
                           +"'"+')">'
                           +'<div class="onlineLeft"><img src="php/'
                           + onlineList[i]['img']
                           +'">'
                           
                           + '</div>'
                           + '<div class="onlineRight">'
                           + '<div class="onlineName">'
                           + onlineList[i]['name']
                           +'</div>'
                           + '<div class="onlineSex">'
                           + onlineList[i]['sex']
                           +'</div>'
                           +'</div>'
                           +'</button><span class="msgNum" id=msg_tixing_'
                           + onlineList[i]['token']
                           + '></span>';

                        // '<button  onclick="showMessage('+"'"+ onlineList[i]['token'] 
                        //   +"'"+')">和他聊天'
                        //   + onlineList[i]['sex']
                        //   +' </button><img style="'+'width:10%;hegith:10%;"'+' src="php/'
                        //   + onlineList[i]['img']
                        //   +'"><span id=msg_tixing_'
                        //   + onlineList[i]['token']
                        //   + '></span>'
                        //   +'<br/>';
                      }
                       
                  }
                  $("#online").html(onlineContent);
                    break;
                  

                  //当用户点击某一个好友时,后台返回的聊天记录
                  case 'returnMessage':
                  $("#message").empty();
                  var messageContent = '';
                  for(var i=received_msg.data.length-1;i>=0;i--){
                      messageContent += received_msg.data[i];
                  }
                  messageContent += "<span class='msg_tail'></span>";
                  //比如发送文字 图片
                  // var actionArea = '<div class="actionArea"><input type="text" name="chatData" id="chatData">'
       // +'<button onclick="sendOne()">发送</button>'
       // +'<input type="file" name="sendFile" id="sendFile">'
       // +'<button onclick="sendFile()">发送图片</button></div>';
                  $("#message").html(messageContent);


                   
                  
                 // $("#message").after(actionArea);
                  //console.log(received_msg.data);
                       break; 
    
                  case 'changeIdByToken':
                  //更新自己的userid
                  console.log(received_msg.data);
                  sessionStorage.setItem('myid',received_msg.data);
                  $("#myid").html(received_msg.data);
                  $("#myself").html('myid is '+ received_msg.data + ' my token is ' + sessionStorage.getItem("mytoken"));
                  break;
               
                 
               };
        
               ws.onclose = function()
               { 
                var mytoken = sessionStorage.getItem("mytoken");
                var data  = {"action":"logout","token":mytoken};
                console.log("连接已关闭..."+mytoken); 
                // register(JSON.stringify(data));
                register(JSON.stringify(mytoken));
                  // 关闭 websocket
                  
               };

       }
     }

       function showMessage(fToken,fName){
        //console.log(fToken);
        friendToken = fToken;
        var token = sessionStorage.getItem("mytoken");
        $("#message").empty();

        //红点提醒消失
        $("#msg_tixing_"+fToken).empty();
        msgNum = 0;
        $("#friendName").html(fName);        
           var data  = {"action":"getMessage","token":token,"fToken":fToken};
           
           register(JSON.stringify(data));



       }
        function sendOne(){
            
            var fToken = friendToken;
            var chatData = $("#chatData").val();          
           var token = sessionStorage.getItem("mytoken");      
           var data  = {"action":"sendOne","token":token,"chatData" : chatData,"fToken":fToken};
           console.log(data);
           register(JSON.stringify(data));

           $("span[class='msg_tail']:last").after(
             "<div class='self'>"+chatData+"</div><span class=msg_tail></span>"
            );            
        }
        

        //用户发送图片
        function sendFile(){
            var formData = new FormData();
            var mytoken = sessionStorage.getItem("mytoken");
            formData.append("file",$("#sendFile")[0].files[0]);
            formData.append("token",mytoken);
             
             $.ajax({
              url : 'php/sendFile.php', 
              type : 'POST', 
              data : formData, 
              // 告诉jQuery不要去处理发送的数据
              processData : false, 
              // 告诉jQuery不要去设置Content-Type请求头
              contentType : false,
              success : function(obj){
               console.log(obj);
               // alert('发送图片成功');
               if (obj.res == 'yes') {
                var chatData = "<div  class='chatImg'><img src='php/"+obj.data+"'></div>";
           var data  = {"action":"sendOne","token":token,"chatData" : chatData,"fToken":fToken};
           console.log(data);
           register(JSON.stringify(data));

           $("span[class='msg_tail']:last").after(
             "<div class='self'><div class='chatImg'><img src='php/"+obj.data+"'></div></div><span class=msg_tail></span>"
            );

           return;
               }
                alert('发送图片失败');
               
              },
              error :function(obj){

              }
             });

           var fToken = friendToken;
            var chatData = $("#chatData").val();          
           var token = sessionStorage.getItem("mytoken");      
           var data  = {"action":"sendOne","token":token,"chatData" : chatData,"fToken":fToken};
           console.log(data);
           register(JSON.stringify(data));

           $("span[class='msg_tail']:last").after(
             "<div class='self'>"+chatData+"</div><span class=msg_tail></span>"
            );            
        }
