<?php
//官网demo


$url = 'xxxxx';
$server = new swoole_websocket_server($url, 9501);


$userArr = [];
$server->on('open', function (swoole_websocket_server $server, $request) {
     
      global $userArr;
     array_push($userArr,$request->fd);
	// file_put_contents('id.txt',$request->fd);
    echo "server: handshake success with fd{$request->fd}\n";//$request->fd 是客户端id
});

$server->on('message', function (swoole_websocket_server $server, $frame) {
    // echo "receive from {$frame->fd}:{$frame->data},opcode:{$frame->opcode},fin:{$frame->finish}\n";
    
   //$frame->fd 是客户端id，$frame->data是客户端发送的数据
    //服务端向客户端发送数据是用 $server->push( '客户端id' ,  '内容')
      // file_put_contents('phone.txt',$frame->data);
     // $m = file_get_contents('id.txt');
      global $userArr;
      $m = count($userArr);
     // for ($i=1; $i <=$m ; $i++) { 
     // 	 $data = "$frame->fd"."{$frame->data}<br>";
     //     $server->push($i, $data);
     // }

     foreach ($userArr as $key => $value) {
        $server->push($value, $frame->data);
     }

});

$server->on('close', function ($ser, $fd) {
    global $userArr;
    echo "client {$fd} closed\n";
    
    $i = array_search($fd,$userArr);
    unset($userArr[$i]);
});

$server->start();

?>
