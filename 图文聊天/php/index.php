<?php
$ws = new swoole_websocket_server("0.0.0.0", 9503);

//监听WebSocket连接打开事件
$ws->on('open', function ($ws, $request) {
    
    //一进来就接收在线用户
    $redis = new Redis();
    $redis->connect('127.0.0.1', 6379);

    // $userlist = $redis->lgetrange('userlist',0,-1);
    $topTen = $redis->lgetrange('userlist',0,10);
            $onlineData = null;
            for ($i=0; $i <count($topTen) ; $i++) { 
                $onlineData[] = $redis->hgetall('token_'.$topTen[$i]);
            }

    $returnData = [
     'action'=>'onlineData',
     'data'=>json_encode($onlineData)
    ];

    $ws->push($request->fd, json_encode($returnData));
});

//监听WebSocket消息事件
$ws->on('message', function ($ws, $frame) {
    // echo "Message: {$frame->data}\n";
    //客户端发来的信息
    //
    var_dump($ws->connections);
    $redis = new Redis();
    $redis->connect('127.0.0.1', 6379);

    //var_dump($frame->data);
    $data = json_decode($frame->data,true);
    //var_dump($data);
    //var_dump($data[0]);
    $action = $data['action'];
    
    switch ($action) {
    	case 'register':
            if (empty($data['sex']) || $data['sex']=='女' ){
                $sex = '女';
            }else{
                $sex = '男';
            }
    		$name = $data['name'];
    		$token = md5(time().rand(1000,9999).$name);
            
      //       $userInfo = [
      //       'token'=>$token,
      //       'name'=>$name,
      //       'register_time'=>date('Y-m-d H:i:s')
      //       ];
    		$redis->lpush('userlist',$token);
            // $redis->lpush('userlist',$frame->fd);
    		$tokenData = [
              'sex'=>$sex,
              'name'=>$name,
              'userid'=>$frame->fd,
              'token'=>$token,
              'img'=>'defaultImg/default.jpg'
    		];

            
            
            //默认10个在线人数
            
            
            // echo '在线人数有 '.count($topTen);
            // var_dump($topTen);

            $topTen = $redis->lgetrange('userlist',0,10);
            $onlineData = '';
            $onlineData[] = $tokenData;
            // var_dump($onlineData);
            // !!!!最后一个进来的读不出来 bug
            for ($i=1; $i <count($topTen); $i++) {
                
            $onlineData[] = $redis->hgetall('token_'.$topTen[$i]);
                             
            }

            var_dump($onlineData);
    		$redis->hMset('token_'.$token,$tokenData);
    		$redis->expire('token_'.$token,60*60);
            
           // $redis->set($frame->fd,$token);
            //$redis->expire($frame->fd,60*60);

    		$returnData = [
             'action'=>'register',
             'res'=>'yes',
             'name'=>$name,
             'token'=>$token,
             'userid'=>$frame->fd,
             // 'onlineData'=>$onlineData          //在线的数据
    		];
    		//$ws->push($frame->fd,$onlineData);
            $ws->push($frame->fd, json_encode($returnData));
            
            //告诉所有在线用户 有新用户注册了
            $returnonlineData['action']  = 'onlineData';
            $returnonlineData['data'] = json_encode($onlineData);

// var_dump($returnonlineData);
            foreach($ws->connections as $fd)
{
    $ws->push($fd, json_encode($returnonlineData));
}

            // for ($i=0; $i < count($onlineData) ; $i++) {

            // 	$ws->push($onlineData[$i], json_encode($returnonlineData));
            // }
            // var_dump(json_encode($returnData));
    		break;

          
    	case 'sendOne':
    		$userToken = $data['token'];
		    $acceptToken = $data['fToken'];

		    $content = $data['chatData'];
            // $acceptToken = $redis->get($toID);

		    // var_dump('from token '.$userToken);
            // $fromID = $redis->HGet('token_'.$userToken,'userid');

            // $fromToken = $data['fromToken'];
            /*            
            存储消息
             */
            $redis->lpush('msg_'.$userToken.'_'.$acceptToken,'<div class="self">'.$content.'</div>');
            $redis->lpush('msg_'.$acceptToken.'_'.$userToken,'<div class="other">'.$content.'</div>');


		    $toData = [
             'action'=>'acceptOne',
             'content'=>'<div class="other">'.$content.'</div>',
             'fromToken'=>$userToken,
             'time'=>date('Y-m-d H:i:s')
		    ];

            $toID = $redis->hget('token_'.$acceptToken,'userid');

		    // var_dump($toData);
		    $ws->push($toID,json_encode($toData));

    		break;
    	case 'getMessage':
    		$userToken = $data['token'];
            //$toID = $data['fid'];
            // $acceptToken = $redis->get($toID);
            $acceptToken = $data['fToken'];  //好友token
            
            $res = $redis->lrange('msg_'.$userToken.'_'.$acceptToken,0,-1);

            $return['action'] = 'returnMessage';
            $return['data'] = $res;
       
            $ws->push($frame->fd,json_encode($return));
    		break;

            //用户刷新
            case 'changeIdByToken':
            $userToken = $data['token']; 

            echo 'before is is'.$redis->hget('token_'.$userToken,'userid');
            $redis->hdel('token_'.$userToken,'userid');
            $redis->hset('token_'.$userToken,'userid',$frame->fd);

            echo '--after is is'.$redis->hget('token_'.$userToken,'userid');
            
            //$redis->lpush('userlist',$frame->fd);
            //$redis->set($frame->fd,$userToken);
            
            // $newUserId = $redis->hget('token_'.$userToken,'userid');
            $changeData = [
            'action'=>'changeIdByToken',
            'data'=>$frame->fd          //这是新的userid
            ];

            $ws->push($frame->fd,json_encode($changeData));
            //更新后的在线人数数据
            $topTen = $redis->lgetrange('userlist',0,10);
            $onlineData = '';
            for ($i=0; $i <count($topTen) ; $i++) { 
                $onlineData[] = $redis->hgetall('token_'.$topTen[$i]);
            }

            
            // $onlineData = $redis->lgetrange('userlist',0,-10);
            $returnonlineData['action']  = 'onlineData';
            $returnonlineData['data'] = json_encode($onlineData);
     
            foreach($ws->connections as $clientid)
{
    if ($clientid != $frame->fd) {
       $ws->push($clientid, json_encode($returnonlineData));
    }
    
}

                break;


                case 'logout':
                    var_dump($data['token']);
                    break;


                case 'getOnlineData':
            $topTen = $redis->lgetrange('userlist',0,10);
            $onlineData = '';
            for ($i=0; $i <count($topTen) ; $i++) { 
                $onlineData[] = $redis->hgetall('token_'.$topTen[$i]);
            }
            $returnonlineData['action']  = 'onlineData';
            $returnonlineData['data'] = json_encode($onlineData);
            $ws->push($frame->fd, json_encode($returnonlineData));
                    break;
    	default:
    		# code...
    		break;
    }
    
     

   
});

//监听WebSocket连接关闭事件
$ws->on('close', function ($ws, $fd) {
    echo "client-{$fd} is closed\n";
    
    // var_dump($ws);
    // var_dump("accept data is ".$ws->data);
    $redis = new Redis();
    $redis->connect('127.0.0.1', 6379);
    $redis->del($fd);
    $res = $redis->LRem('userlist',$fd,0);
    var_dump('删除在线用户'+$res);


            $topTen = $redis->lgetrange('userlist',0,10);
            $onlineData = '';
            for ($i=0; $i <count($topTen) ; $i++) { 
                $onlineData[] = $redis->hgetall('token_'.$topTen[$i]);
            }

    // $onlineData = $redis->lgetrange('userlist',0,-1);
       $returnonlineData['action']  = 'onlineData';
            $returnonlineData['data'] = json_encode($onlineData);

            foreach($ws->connections as $clientid)
{
    if ($clientid != $fd) {
       $ws->push($clientid, json_encode($returnonlineData));
    }
    
}

});

$ws->start();



?>
