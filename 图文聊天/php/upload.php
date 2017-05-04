<?php 
// error_reporting(E_ALL);
//修改redis
header("content-type:application/json");


if (empty($_POST['token']) || empty($_FILES['file']) ) {
   $no['res'] = 'no';
   $no['msg'] = '请完整填写信息';
   echo json_encode($no);
   exit();
}
$token = 'token_'.$_POST['token'];
$redis = new Redis();
$redis->connect('127.0.0.1', 6379);

$isExist = $redis->hgetall($token);
if (!$isExist) {
   $no['res'] = 'no';
   $no['msg'] = '用户不存在';
   echo json_encode($no);
   exit();
}





$file = $_FILES['file'];
$saveName = 'uploadImg/'.time().rand(1000,9999).'.jpg';
$res = move_uploaded_file($file['tmp_name'], $saveName);
if (!$res) {
   $no['res'] = 'no';
   $no['msg'] = '上传文件失败';
   echo json_encode($no);
   exit();
}

$isExist['img'] = $saveName;
$bool = $redis->hmset($token,$isExist);
if (!$bool) {
   $no['res'] = 'no';
   $no['msg'] = '修改图片失败';
   echo json_encode($no);
   exit();
}

   $yes['res'] = 'yes';
   $yes['msg'] = '修改图片成功';
   $yes['data'] = $saveName;
   echo json_encode($yes);
   exit();
// $userData = []
// if (empty($isExist['img'])) {
  
// }
// echo $token.'---';
// var_dump($file);



// var_dump($onlineData);


// $token = $_GET['token'];
    // var_dump($redis->set($token,$token));
 
  // $userInfo = [
  //           'token'=>'xx',
  //           'name'=>$name,
  //           'register_time'=>date('Y-m-d H:i:s')
  //           ];
  //   		$redis->lpush('userlist',json_encode($userInfo));

 ?>