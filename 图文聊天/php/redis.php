<?php 
$redis = new Redis();
    $redis->connect('127.0.0.1', 6379);

$topTen = $redis->lgetrange('userlist',0,10);
            $onlineData = '';

echo count($topTen);
            for ($i=0; $i <count($topTen) ; $i++) { 
                $onlineData[] = $redis->hgetall('token_'.$topTen[$i]);
            }

var_dump($onlineData);


// $token = $_GET['token'];
    // var_dump($redis->set($token,$token));
 
  // $userInfo = [
  //           'token'=>'xx',
  //           'name'=>$name,
  //           'register_time'=>date('Y-m-d H:i:s')
  //           ];
  //   		$redis->lpush('userlist',json_encode($userInfo));

 ?>
