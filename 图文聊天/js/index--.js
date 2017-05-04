var friendID = '';
var msgArr = new Array();        //消息数组
var msgNum = 0;

var mytoken = sessionStorage.getItem('mytoken');
if (mytoken=='null' || mytoken== 'undefined' || mytoken=='') {
   console.log('name is  null' + mytoken);
  }else{
    $("#mytoken").html(mytoken);
    var myid = sessionStorage.getItem('myid');
    $("#mytoken").html(myid);
    var data  = {"action":"changeIdByToken","token":mytoken};
    register(JSON.stringify(data));
  }


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
          
           $("#register").click(function(){
           var name = $("#name").val();
           console.log(name);
           sessionStorage.setItem('name',name);
           var data  = {"action":"register","name":name};
           
           register(JSON.stringify(data));
            });

        });
 

       function register(data){
        var ws = new WebSocket("ws://192.168.8.129:9503");
          ws.onopen = function()
               {
                  // Web Socket 已连接上，使用 send() 方法发送数据
                  ws.send(data);
                  console.log("数据发送中..."+data);
               };
        
               ws.onmessage = function (evt) 
               { 
                  console.log(evt.data);
                  var received_msg = JSON.parse(evt.data);
                  var action = (received_msg.action);
                  // console.log(received_msg + "---" + action);
                  
                  switch(action){
                    case 'register':
                  
                  sessionStorage.setItem("mytoken", received_msg.token);
                  sessionStorage.setItem("myid", received_msg.userid);
                  $("#myself").html('myid is '+ received_msg.userid + ' my token is ' + received_msg.token);
                  // sessionStorage.token=received_msg.token;
                    break;

                    case 'sendOne':
                      console.log('sendOne');
                      break;
                    
                    //有人给我发信息
                    case 'acceptOne':
                    // console.log('acceptOne');
                    // console.log(received_msg);


                    //存放在数组
                    // var 'message_'+received_msg.fromID = new Array();

                    // $("#message").after('<div style="float:right">'+received_msg.fromID + "给你发了信息---" +  received_msg.content +'--' +received_msg.time+"</div><br/>");
                    // msgArr[received_msg.fromID]
                    

                    // friendID==received_msg.fromID

                    console.log('chat with ' + friendID + '---'+received_msg.fromID);
                    if (friendID==received_msg.fromID) {
                      $("span[class='msg_tail']:last").after(received_msg.content+"<span class='msg_tail'></span>");
                     
                     console.log('has new message ');

                    }else{
                      $("#msg_tixing_"+received_msg.fromID).html(++msgNum);
                    }


                     
                      break;


                    case 'onlineData':

                    // var myid = $("#myid").html();
                     var myid = sessionStorage.getItem("myid");
                    console.log(myid+' my id is');
                     var onlineData = received_msg.data;
                  // console.log(onlineData);
                  var onlineList = onlineData;
                  var onlineContent = '';
                  for(var i=0;i<onlineList.length;i++){
                      
                      //不能自己与自己聊天
                      if (onlineList[i] != myid) {
                       
                           onlineContent += 
                        '<button  onclick="showMessage('+ onlineList[i] 
                          +')">和他聊天'
                          + onlineList[i]
                          +' </button>'
                          +'<span id=msg_tixing_'
                          + onlineList[i]
                          + '></span>'
                          +'<br/>';
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
                  $("#message").html(messageContent);
                  console.log(received_msg.data);
                       break;             
               
                 
               };
        
               ws.onclose = function()
               { 
                  // 关闭 websocket
                  console.log("连接已关闭..."); 
               };

       }
     }

       function showMessage(fid){
        console.log(fid);
        friendID = fid;
        var token = sessionStorage.getItem("mytoken");
        $("#message").empty();

        //红点提醒消失
        $("#msg_tixing_"+fid).empty();
        $("#friendName").html(fid);        
           var data  = {"action":"getMessage","token":token,"fid":fid};
           
           register(JSON.stringify(data));

       }
        function sendOne(){
            
            var fid = friendID;
            var chatData = $("#chatData").val();          
           var token = sessionStorage.getItem("mytoken");      
           var data  = {"action":"sendOne","token":token,"chatData" : chatData,"fid":fid};
           console.log(data);
           register(JSON.stringify(data));

           $("span[class='msg_tail']:last").after(
             "<div class='self'>"+chatData+"</div><span class=msg_tail></span>"
            );

            
        }