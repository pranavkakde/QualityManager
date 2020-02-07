$username='pranav'
$ppk='.\keyfile\privatekey.ppk'
$chost='192.168.20.15'
$baseFolder='.\packages\Services'
$folderList = dir -Directory $baseFolder
foreach ($d in $folderList){
    $fullpath  = "$baseFolder\${d}\"
    $childFolders = dir -Directory $fullpath
    foreach($c in $childFolders){
        $folderToMove = "$fullpath${c}\*"
        $folderToMove
        if(($c -Match 'node_modules') -or ($c -Match 'log')){
            
        }else{
            #.\lib\pscp.exe -batch -i "${ppk}" $folderToMove "${username}@${chost}:~/app/${d}/"
            .\lib\scp.exe -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=quiet -3 -r -o Port=22 -o IdentityFile=$ppk $folderToMove "${username}@${chost}:~/app/${d}/"
        }         
    }
}