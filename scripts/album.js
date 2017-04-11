var setSong = function(songNumber){
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
         formats: [ 'mp3' ],
         preload: true
     });
    
    setVolume(currentVolume);
 };

var seek = function(time) {
     if (currentSoundFile) {
         currentSoundFile.setTime(time);
     }
 };

var setVolume = function(volume) {
    if (currentSoundFile){
        currentSoundFile.setVolume(volume);
    }
};

var setCurrentTimeInPlayerBar = function (currentTime) {
    var time = $('.current-time').text(currentTime);
};

var setTotalTimeInPlayerBar = function (totalTime) {
    var time = $('.total-time').text(totalTime);
};

var filterTimeCode = function (time) {
    time = parseFloat(time / 60);
    time = time.toString();
    
    var index = time.indexOf('.'),
        minutes = time.substr(0, index),
        seconds = time.substr(index, 3);
    
    seconds = Math.floor(seconds * 60);
    seconds = seconds.toString();
    
    if (seconds.length === 1) {
        seconds = '0' + seconds;
    }
    return minutes + ':' + seconds;
};

var getSongNumberCell = function (number){
    return $('.song-item-number[data-song-number="' + number + '"]');
};

var createSongRow = function(songNumber, songName, songLength) {
     var template =
        '<tr class="album-view-song-item">'
      + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
      + '  <td class="song-item-title">' + songName + '</td>'
      + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
      + '</tr>'
      ;
 
     var $row = $(template);
    
     var clickHandler = function(){
         var songNumber = parseInt($(this).attr('data-song-number'));

         if (currentlyPlayingSongNumber === null) {
             $(this).html(pauseButtonTemplate);
             setSong(songNumber);
             currentSoundFile.play();
         } else if (currentlyPlayingSongNumber === songNumber) {
             $(this).html(playButtonTemplate);
             currentSoundFile.togglePlay();
             if (currentSoundFile.isPaused()){
                 $(this).html(playButtonTemplate);
             } else {
                 $(this).html(pauseButtonTemplate);
             }
         } else if (currentlyPlayingSongNumber !== songNumber) {
             var currentlyPlayingSongElement = getSongNumberCell(currentlyPlayingSongNumber);
             currentlyPlayingSongElement.html(currentlyPlayingSongElement.attr('data-song-number'));
             $(this).html(pauseButtonTemplate);
             setSong(songNumber);
             currentSoundFile.play();
         }
         updateSeekBarWhileSongPlays();
         updateSeekPercentage($('.volume'), (currentVolume/100));
         updatePlayerBarSong();
     };
     $row.find('.song-item-number').click(clickHandler);
     $row.hover(onHover, offHover);
     return $row;
 };
    
     var onHover = function (event){
        var song = $(this).find('.song-item-number');
        var songNumber = parseInt(song.attr('data-song-number'));
        if (songNumber !== currentlyPlayingSongNumber){
            song.html(playButtonTemplate);
        }
     };
     var offHover = function (event){
         var song = $(this).find('.song-item-number');
         var songNumber = parseInt(song.attr('data-song-number'));
         console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);
         if (songNumber !== currentlyPlayingSongNumber){
             song.html(songNumber);
          }
     };

var setCurrentAlbum = function(album) {
     currentAlbum = album;
     var $albumTitle = $('.album-view-title');
     var $albumArtist = $('.album-view-artist');
     var $albumReleaseInfo = $('.album-view-release-info');
     var $albumImage = $('.album-cover-art');
     var $albumSongList = $('.album-view-song-list');
 
     $albumTitle.text(album.title);
     $albumArtist.text(album.artist);
     $albumReleaseInfo.text(album.year + ' ' + album.label);
     $albumImage.attr('src', album.albumArtUrl);
 
     $albumSongList.empty();
 
     for (var i = 0; i < album.songs.length; i++) {
         var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
         $albumSongList.append($newRow);
     }
};

var updateSeekBarWhileSongPlays = function() {
     if (currentSoundFile) {
         
         currentSoundFile.bind('timeupdate', function(event) {
             
             var seekBarFillRatio = this.getTime() / this.getDuration();
             var $seekBar = $('.seek-control .seek-bar');
             
             var updateTime = filterTimeCode(this.getTime());
             setCurrentTimeInPlayerBar(updateTime);
 
             updateSeekPercentage($seekBar, seekBarFillRatio);
             setCurrentTimeInPlayerBar(this.getTime());
         });
     }
 };
var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
 
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
 };

var setupSeekBars = function() {
     var $seekBars = $('.player-bar .seek-bar');
 
     $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;
        
        if ($(this).parent().attr('class') === 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);   
        }
        
        updateSeekPercentage($(this), seekBarFillRatio);
    });

    $seekBars.find('.thumb').mousedown(function(event) {

        var $seekBar = $(this).parent();

        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            
            if ($seekBar.parent().attr('class') === 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());   
            } else {
                setVolume(seekBarFillRatio);
            }
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
 
         $(document).bind('mouseup.thumb', function() {
             $(document).unbind('mousemove.thumb');
             $(document).unbind('mouseup.thumb');
         });
     });
    
 };

var setTotalTimeInPlayerBar = function(totalTime) {
    $('.total-time').text(filterTimeCode(totalTime));
};

var setCurrentTimeInPlayerBar = function(currentTime){
    $('.current-time').text(filterTimeCode(currentTime));
};

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};
var nextSong = function() {
    var album = currentAlbum;
    var song = currentSongFromAlbum;
    var getLastSongNumber = function(index) {
        return index == 0 ? album.songs.length : index;
    };
    
    var currentSongIndex = trackIndex(album, song);
    currentSongIndex++;
    
    if (currentSongIndex >= album.songs.length) {
        currentSongIndex = 0;
    }
    
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    updatePlayerBarSong();
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var previousSong = function() {
    var album = currentAlbum;
    var song = currentSongFromAlbum;
    var getLastSongNumber = function(index) {
        return index === (album.songs.length-1) ? 1 : index + 2;
    };
    
    var currentSongIndex = trackIndex(album, song);
    currentSongIndex--;
    
    if (currentSongIndex < 0) {
        currentSongIndex = album.songs.length - 1;
    }
    
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    updatePlayerBarSong();
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var togglePlayFromPlayerBar = function(){
    var currentlyPlayingSongElement = getSongNumberCell(currentlyPlayingSongNumber);
    if (currentSoundFile){
        if (currentSoundFile.isPaused()){
            $('.main-controls .play-pause').html(playerBarPauseButton);
            currentlyPlayingSongElement.html(pauseButtonTemplate);
            currentSoundFile.play();
        } else {
            $('.main-controls .play-pause').html(playerBarPlayButton);
            currentlyPlayingSongElement.html(playButtonTemplate);
            currentSoundFile.pause();
        }
    } else if (currentAlbum){
        setSong(1);
        currentlyPlayingSongElement.html(pauseButtonTemplate);
        currentSoundFile.play();
        updatePlayerBarSong();
    }
};

var updatePlayerBarSong = function(){
    if (currentlyPlayingSongNumber) {
        $('.currently-playing .song-name').text(currentSongFromAlbum.title);
        $('.currently-playing .artist-name').text(currentAlbum.artist);
        $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
        $('.main-controls .play-pause').html(playerBarPauseButton);
        setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
        if (currentSoundFile.isPaused()){
            $('.main-controls .play-pause').html(playerBarPlayButton);
        } else {
            $('.main-controls .play-pause').html(playerBarPauseButton);
        }
    } else {
        $('.main-controls .play-pause').html(playerBarPlayButton);
    }
   
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next')
var $playButton = $('.main-controls .play-pause')

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $playButton.click(togglePlayFromPlayerBar);
 });