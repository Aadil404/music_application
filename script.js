console.log("lets write some java script")

let currFolder;
let currentSong=new Audio()  //it is a global variable
let songs;


async function getSongs(folder){
    currFolder=folder;
    let a=await fetch(`http://192.168.31.119:3000/Spotify_Clone/${currFolder}/`)  //fetch all songs from songs folder
    let response=await a.text();                                          //this will contain songs folder info in form of text(html format)
    let div=document.createElement('div')
    div.innerHTML=response                               
    let as=div.getElementsByTagName("a");               //songs was in anchor tags, so i target anchor tags                           
    songs=[]
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

    let songUL=document.querySelector(".songlist").getElementsByTagName("ul")[0]  //originally ul is present in HTML collection, we use [0] to acces our ul
    songUL.innerHTML=""
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
            playMusic((e.querySelector(".songinfo").firstElementChild.innerHTML))
        })
    })
}


let play=document.querySelector(".play")  //it is playsong button
const playMusic = (track,pause=false)=>{
    // let audio=new Audio("/Spotify_Clone/songs/" + track);  //i add extar string to make the url of songs, other wise it is showing not found
    currentSong.src=`/Spotify_Clone/${currFolder}/` + track
    
    //first song of the playlist is always loaded to play without clicking on it
    if(!pause){
        currentSong.play();
        play.src="pausesong.svg"  //change the logo
    }
    document.querySelector(".songname").innerHTML=track;
    document.querySelector(".songtime").innerHTML="00:00/00:00";
}

async function displayAlbums(){
    let a=await fetch(`http://192.168.31.119:3000/Spotify_Clone/songs/`) 
    let response=await a.text();                                        
    let div=document.createElement('div')
    div.innerHTML=response   
    let anchors =div.getElementsByTagName("a");
    let cardContainer=document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
        if(e.href.includes("/songs")){
            let parts = e.href.split("/");     
            let fileName = parts[parts.length - 2];
            let a=await fetch(`http://192.168.31.119:3000/Spotify_Clone/songs/${fileName}/info.json`) 
            let response=await a.json();  
            cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card">
                <div class="playbutton">
                    <img src="play.svg" alt="">
                </div>
                <img src="songs/${fileName}/cover.jpeg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`  
        }
    }


    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
           
            //do this to extract album name (i am extracting album name from image src)
            //we can also use dataset to store folder name 
            let img=e.getElementsByTagName("img");
            let src=img[1].src
            let parts = src.split("/");
            let album=parts[parts.length -2]
            
            await getSongs(`songs/${album}`);
            playMusic(songs[0]);     //play first song when album clicked
        })
    })

}

async function main(){    
    await getSongs("songs/ncs");     //load the first folder

    playMusic(songs[0],true);   //load the first song on playbar

    displayAlbums();

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
        let runningSong=parts[parts.length - 1];
        let index=songs.indexOf(runningSong);
        if(index-1 >= 0) playMusic(songs[index-1]);
        else playMusic(songs[index]);
    })

    //add event listner to next
    let next=document.querySelector(".next");
    next.addEventListener("click",()=>{
        let parts = currentSong.src.split("/");   
        let runningSong=parts[parts.length - 1];
        let index=songs.indexOf(runningSong);
        if(index+1 < songs.length) playMusic(songs[index+1]);
        else playMusic(songs[index]);
    })

    //add event listner to volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume=parseInt(e.target.value)/100;
    })

    //add event listner to mute the volume
    document.querySelector(".volume img").addEventListener("click",(e)=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg");
            currentSong.volume=0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value=0;

        }else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg");
            currentSong.volume=.25;
            document.querySelector(".volume").getElementsByTagName("input")[0].value=25;
        }
    })

}

 
main(); 