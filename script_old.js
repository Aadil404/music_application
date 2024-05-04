console.log("lets write some java script")

async function getSongs(){
    let a=await fetch("http://192.168.31.119:3000/Spotify_Clone/songs/")  //fetch all songs from songs folder
    let response=await a.text();                                          //this will contain songs folder info in form of text(html format)
    let div=document.createElement('div')
    div.innerHTML=response                               
    let as=div.getElementsByTagName("a");               //songs was in anchor tags, so i target anchor tags                           
    let songs=[]
    //songs are present on href of some anchor tags, find them and then push them in an array
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if(element.href.endsWith(".mp3")){
            let songURL=element.href;
            let parts = songURL.split("/");     //extarcting name of song from url, then pushing only name
            let fileName = parts[parts.length - 1];
            songs.push(fileName);
        }
        
    }
    return songs;
}

let currentSong=new Audio()  //it is a global variable
let songs;

let play=document.querySelector(".play")  //it is playsong button
const playMusic = (track,pause=false)=>{
    // let audio=new Audio("/Spotify_Clone/songs/" + track);  //i add extar string to make the url of songs, other wise it is showing not found
    currentSong.src="/Spotify_Clone/songs/" + track
    
    //first song of the playlist is always loaded to play without clicking on it
    if(!pause){
        currentSong.play();
        play.src="pausesong.svg"  //change the logo
    }
    document.querySelector(".songname").innerHTML=track;
    document.querySelector(".songtime").innerHTML="00:00/00:00";
}

async function main(){    
    songs= await getSongs();
    
    playMusic(songs[0],true);   //load the first song on playbar

    let songUL=document.querySelector(".songlist").getElementsByTagName("ul")[0]  //originally ul is present in HTML collection, we use [0] to acces our ul
    //list all songs in libarary
    for (const song of songs) {
        songUL.innerHTML=songUL.innerHTML + `<li><img class="invert" src="music.svg" alt="">
        <div class="songinfo">
            <div>${song}</div>
            <div>Adil</div>
        </div>
        <div class="playnow">
            <span>Play now</span>
            <img class="invert" src="play2.svg" alt="">
        </div></li>`;
    }             

    // let arr=Array.from(document.querySelector(".songlist").getElementsByTagName("li"));  will create an array from li of songlist

    //for each loop attach event listner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",()=>{
            console.log((e.querySelector(".songinfo").firstElementChild.innerHTML))
            playMusic((e.querySelector(".songinfo").firstElementChild.innerHTML))
        })
    })

    //attach event listner to paly pause and previous

    
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src="pausesong.svg"
        }else{
            currentSong.pause()
            play.src="playsong.svg"
        }
    })

    //show duration and current time

    function formatTime(seconds) {     //this function convert seconds to minutes and seconds
        if(isNaN(seconds)) return "00:00"
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
    
    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".songtime").innerHTML=`${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left=(currentSong.currentTime/currentSong.duration) * 100 + "%";
    })

    //add event listener to seek bar

    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        let fraction=e.offsetX/e.target.getBoundingClientRect().width
        document.querySelector(".circle").style.left=(fraction) * 100 + "%";
        currentSong.currentTime=fraction * currentSong.duration;
        document.querySelector(".circle").style.transitionDuration = "0ms";
    })

    //add event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0";
    })

    //add event listener to closebar
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-100%"
    })

    //add event listner to previous
    let previous=document.querySelector(".previous");
    previous.addEventListener("click",()=>{
        let parts = currentSong.src.split("/");   
        runningSong=parts[parts.length - 1];
        let index=songs.indexOf(runningSong);
        if(index-1 >= 0) playMusic(songs[index-1]);
        else playMusic(songs[index]);
    })

    //add event listner to next
    let next=document.querySelector(".next");
    next.addEventListener("click",()=>{
        let parts = currentSong.src.split("/");   
        runningSong=parts[parts.length - 1];
        let index=songs.indexOf(runningSong);
        if(index+1 < songs.length) playMusic(songs[index+1]);
        else playMusic(songs[index]);
    })

    //add event listner to volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume=parseInt(e.target.value)/100;
    })

}

 
main(); 