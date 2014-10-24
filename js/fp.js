window.screen.mozLockOrientation('portrait');
var folders=new Array; var cella=new Array;
var audio1=document.createElement("audio");
var playlist=new Array;
var currsong_index=-1; var currsong_name=''; var currfold_index=0;
var stopped=true;
var xmouse1=0; var ymouse1=0; var target1;
var preventclick=false;
audio1.mozAudioChannelType='content';
audio1.addEventListener("ended",next_song, false );
audio1.addEventListener("play", update_display, false );

window.onload=function () {
	var button_sync=document.getElementById('button_sync');
	button_sync.addEventListener("click",scan_music, false );
	document.getElementById('td_plprevtrack').addEventListener('click', prev_song, false );
	document.getElementById('td_plpause').addEventListener('click', pause, false );
	document.getElementById('td_plstop').addEventListener('click', pl_button_stop, false );
	document.getElementById('td_plnexttrack').addEventListener('click', next_song, false );	

	document.getElementById('table_player_up').addEventListener('touchstart', pl_touchstart, false );
	document.getElementById('table_player_up').addEventListener('touchend', pl_touchend, false );
	document.getElementById('table_player_up').addEventListener('click', pause, false );
	
	document.getElementById('linguetta').addEventListener('click', commuteview, false );
	document.getElementById('button_commute').addEventListener('click', pause, false );
	
	//nascondo le etichette di debug
	document.getElementById('cons').style.display='none';
	document.getElementById('cons2').style.display='none';
	
	//posiziono la "linguetta"
	document.getElementById('linguetta').style.top= document.body.clientHeight-22;
	document.getElementById('linguetta').style.left= document.body.clientWidth-60;
	
	//Carico le cartelle con la musica
	scan_music();
}

function pl_touchstart(tevent) {
	xmouse1=tevent.changedTouches[0].pageX; ymouse1= tevent.changedTouches[0].pageY;	
}

function pl_touchend(tevent) {
	xmouse2=tevent.changedTouches[0].pageX; ymouse2= tevent.changedTouches[0].pageY;
	if(Math.abs(ymouse1-ymouse2) < 59) {
		if((xmouse1-xmouse2) < -100) { prev_song(); }
		if((xmouse1-xmouse2) > 100) { next_song(); }
	}
}


function fold_touchstart(tevent) {
	xmouse1=tevent.changedTouches[0].pageX; ymouse1= tevent.changedTouches[0].pageY;
	target1=tevent.changedTouches[0].target; document.getElementById('cons2').innerHTML=target1;
}
function fold_touchend(tevent) {
	xmouse2=tevent.changedTouches[0].pageX; ymouse2= tevent.changedTouches[0].pageY;
	target2=tevent.changedTouches[0].target;
	if((Math.abs(ymouse1-ymouse2) < 59)&& (target1 == target2)) {
		if((xmouse1-xmouse2) > 120) { addfolder(target2); }
	}
}

function file_touchstart(tevent) {
	xmouse1=tevent.changedTouches[0].pageX; ymouse1= tevent.changedTouches[0].pageY;
	target1=tevent.changedTouches[0].target;
}
function file_touchend(tevent) {
	xmouse2=tevent.changedTouches[0].pageX; ymouse2= tevent.changedTouches[0].pageY;
	target2=tevent.changedTouches[0].target;
	if((Math.abs(ymouse1-ymouse2) < 59)&& (target1 == target2)) {
		if((xmouse1-xmouse2) > 120) { addfiletoplaylist(target2); }
	}
}


	
function scan_music() {
	document.getElementById('table_folders').innerHTML="<font color=#0E8F8F><h3><center>...</center></h3></font>";
	//stoppo tutto (resetto la playlist etc)
	stop(); showfolders();
	//svuoto l'array dei file
	folders.splice(0,folders.length);
	
	var musica=navigator.getDeviceStorage('music');
	request=musica.enumerate();

	request.onsuccess=function() { 
		if(this.result){
			var filetemp=this.result;
			filelong=filetemp.name;
			if(ismusic(filelong)) {
				fold=getfolder(filelong);
				file=getname(filelong);
				addfile(file,fold);
			} 
		this.continue();}else{ display_table(); }
	}
	request.onerror=function() {
		document.getElementById('cons2').innerHTML=this.error.name;
	}	
}


function display_table() {
	folders.sort(); var tabella=document.getElementById('table_folders');
	tabella.innerHTML=''; tabella.style.width=document.body.clientWidth*0.95;
	for(i=0;i<folders.length;i++) { numerofiles=folders[i].length-1;
		var riga=tabella.insertRow(-1);
		cella[i]=riga.insertCell(0);
		
		str="<span class=\"sp_foldername\" id=\"spfold"+i+"\">"+folders[i][0].substr(13)+"</span><br>";
		str+="<span class=\"sp_files\">"+ numerofiles + " files</span>";
		
		cella[i].innerHTML=str;
		cella[i].className='tdfolder'; cella[i].id='tdfold'+i;
		cella[i].addEventListener("click", function() { displayfolder(this);}, false );
		cella[i].addEventListener("contextmenu", function() { addfolder_excl(this); } , false);
		cella[i].addEventListener("touchstart", fold_touchstart, false);
		cella[i].addEventListener("touchend", fold_touchend, false);
	}
} 

function displayfolder(tdelem) {
	if(preventclick) { return; }
	ifold=tdelem.id.substr(6);
	var temparr=new Array;
	var tabella=document.getElementById('table_folders'); 
	tabella.innerHTML=''; tabella.style.width=document.body.clientWidth*0.95;
	var riga=tabella.insertRow(-1);
	cella=riga.insertCell(0); cella.innerHTML='<span class=\"sp_foldername\"><b><</b></span>'; 
	cella.className='tdback';
	cella.addEventListener("click", display_table, false );
	
	cella=riga.insertCell(-1); 
	cella.innerHTML="<span class=\"sp_foldertitle\">"+folders[ifold][0].substr(13)+"</span>"; 
	cella.className='tdfoldname'; currfold_index=ifold;
	
	//ordinamento della cartella eccetto il primo elemento
	fn=folders[ifold][0]; folders[ifold].sort();
	for(i=folders[ifold].length-1;i>0;i--) {
		if(folders[ifold][i]==fn) { 
			swap=folders[ifold][i-1]; folders[ifold][i-1]=folders[ifold][i];
			folders[ifold][i]=swap;
		}
	}
	
	
	for(i=1;i<folders[ifold].length;i++) {
		var riga=tabella.insertRow(-1);
		cella[i]=riga.insertCell(0);
		
		str="<span class=\"sp_filename\" id=\"spfile" + i + "\">"+folders[ifold][i]+"</span>";
		
		cella[i].innerHTML=str; cella[i].colSpan=2;
		cella[i].className='tdfile'; cella[i].id='tdfile'+i;
		cella[i].addEventListener("contextmenu", function(){ addfiletoplaylist_excl(this);}, false );
		cella[i].addEventListener("touchstart", file_touchstart, false);
		cella[i].addEventListener("touchend", file_touchend, false);
	}
	
}

function reset_playlist() { playlist.splice(0,playlist.length); }

function addfiletoplaylist_excl(tdelem) {
	if(confirm('Reset playlist and play only this file?')) { 
		reset_playlist(); 
		addfiletoplaylist(tdelem); currsong_index=-1;
		commuteview(); stopped=false; next_song();
	}
}

function addfiletoplaylist(tdelem) {
	ifile=tdelem.id.substr(6);
	entry=folders[currfold_index][0]+'/'+folders[currfold_index][ifile];
	document.getElementById('cons').innerHTML=tdelem.id;
	playlist.push(entry);
	update_playlistcounter();
}

function addfolder_excl(tdelem) {
	preventclick=true;
	if(confirm('Reset playlist and play this folder?')) { 
		reset_playlist(); 
		addfolder(tdelem); 
	}
	preventclick=false; currsong_index=-1; commuteview(); stopped=false; next_song();
	
}

function addfolder(tdelem) {
	ifold=tdelem.id.substr(6);
	for(i=1;i<folders[ifold].length;i++) { 
		entry=folders[ifold][0]+'/'+folders[ifold][i];
		playlist.push(entry);
	}
	update_playlistcounter();
	playlist.sort();
}

function next_song() {
	currsong_index++; 
	if(currsong_index>=playlist.length) { 
		stoppati(); return;
	}
	if(stopped) { return; }
	track=playlist[currsong_index]; currsong_name=track;
		document.getElementById('cons2').innerHTML="searching for "+track;
	var sdcard=navigator.getDeviceStorage('music');
	request_song=sdcard.get(track);

	request_song.onsuccess=function() {
		var file=this.result;
		document.getElementById('cons').innerHTML=file.name;
		//mp3=file.blob;
		audio1.mozAudioChannelType='content';
		audio1.src=window.URL.createObjectURL(file);
		audio1.play();
		setTimeout(update_display,1500);
		stopped=false;
		document.getElementById('icon-commute').style.backgroundImage= 'url("images/playlist_playing.png")'
		document.getElementById('td_plpause').style.backgroundImage= 'url("images/play.png")'	
	}
	request_song.onerror=function() {
		document.getElementById('cons2').innerHTML=this.error.name;
	}

	
}

function prev_song() {
	if(currsong_index > 0) { currsong_index=currsong_index-2; next_song(); }
}

function stop(evt) {
	reset_playlist();
	stoppati();
}
function stoppati() {
	stopped=true; currsong_index=-1;
	audio1.pause();
	document.getElementById('div_plfilename').innerHTML='';
	document.getElementById('div_pltime').innerHTML='';
	document.getElementById('icon-commute').style.backgroundImage= 'url("images/playlist.png")'
	document.getElementById('td_plpause').style.backgroundImage= 'url("images/play.png")'
	update_playlistcounter();
	commuteview();
}

function pl_button_stop() { if(confirm('Stop the player and reset the playlist?')) { stop(); } }

function pause() {
	document.getElementById('cons2').innerHTML=audio1.paused;
	if(audio1.paused) { if(playlist.length==0) { return; }
		if(stopped){ stopped=false; next_song(); }
		else{ audio1.play(); }
		document.getElementById('icon-commute').style.backgroundImage= 'url("images/playlist_playing.png")'
		document.getElementById('td_plpause').style.backgroundImage= 'url("images/pause.png")'
	} else {
		audio1.pause();
		document.getElementById('icon-commute').style.backgroundImage= 'url("images/playlist.png")'
		document.getElementById('td_plpause').style.backgroundImage= 'url("images/play.png")'
	}
}

function update_display() { if(!stopped) { 
	ind=currsong_index+1;
	document.getElementById('div_plfilename').innerHTML='#'+ ind +': ' + getname(currsong_name);
	str=timetostring(audio1.currentTime)+" / "+timetostring(audio1.duration);
	//document.getElementById('cons2').innerHTML=str;
	document.getElementById('div_pltime').innerHTML=str;
	setTimeout(update_display,500);
} }

function ismusic(file) {
	ext=file.substr(file.length-3);
	if(ext.toLowerCase() == 'mp3') { return true;} else {return false;}
}

function getfolder(file) { pos=file.lastIndexOf('/'); fold=file.substr(0,pos); return fold; }
function getname(file) { pos=file.lastIndexOf('/'); fname=file.substr(pos+1); return fname; }

function timetostring(time) {
	minuti=Math.floor(time/60);
	secondi=Math.round(time-minuti*60);
	if(secondi<10){str=minuti+":0"+secondi;}else{str=minuti+":"+secondi;}
	return str;
}
function addfile(file,fold) {
	done=false;
	for(i=0;i<folders.length;i++) {
		if(folders[i][0]==fold) { folders[i].push(file); done=true; }
	}
	if(!done) {
		folders[folders.length]=new Array;
		folders[folders.length-1][0]=fold;
		folders[folders.length-1].push(file);
	}
}

function commuteview() {
	if(document.getElementById('table_folders').style.display=='none') { showfolders(); }
	else { showplayer(); }
}


function showplayer() {
	document.getElementById('table_folders').style.display='none';
	document.getElementById('table_player').style.display='table';
	//posiziono la "linguetta"
	document.getElementById('linguetta').style.backgroundImage= 'url("images/ling_down.png")';	
}

function showfolders() {
	document.getElementById('table_player').style.display='none';
	document.getElementById('table_folders').style.display='table';
	//posiziono la "linguetta"
	document.getElementById('linguetta').style.backgroundImage= 'url("images/ling_up.png")';
}

function update_playlistcounter() {
	document.getElementById('cons2').innerHTML='entering updt_plst';
	counter=document.getElementById('playlistcounter');
	ll=playlist.length; if(ll==0) { ll=''; }
	counter.innerHTML=' ' + ll + ' ';
	counter.style.fontWeight='bold'; counter.style.color='yellow'; counter.style.fontSize='1.8rem';
	setTimeout(fade_playlistcounter, 1000);
}

function fade_playlistcounter() { 
	counter=document.getElementById('playlistcounter');
	counter.style.fontWeight='normal'; counter.style.color='white'; counter.style.fontSize='1.4rem';
}