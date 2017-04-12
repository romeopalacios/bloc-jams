var setSong = function(songNumber) {
	
	if (currentSoundFile) {
		currentSoundFile.stop();
	}

	currentSongNumber = parseInt(songNumber);
	currentSongFromAlbum = currentAlbum.songs[parseInt(songNumber) - 1];
	currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
		formats: ['mp3'],
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
	if (currentSoundFile) {
		currentSoundFile.setVolume(volume);
	}
};

var setCurrentTimeInPlayerBar = function(currentTime) {
	$('.current-time').text(filterTimeCode(currentTime));
};

var setTotalTimeInPlayerBar = function(totalTime) {
	$('.total-time').text(filterTimeCode(totalTime));
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

var getSongNumberCell = function(number) {
	return $('.song-item-number[data-song-number="' + number + '"]');	
};

var createSongRow = function(songNumber, songName, songLength) {
	var template = '<tr class="album-view-song-item">'
	+ '  <td class="song-item-number" data-song-number="' + songNumber + '">'
	+ songNumber + '</td>'
	+	'  <td class="song-item-title">' + songName + '</td>'
	+	'  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>' + '</tr>';

	var $row = $(template);
	var clickHandler = function() {
		var $clickedSongCell = $(this);
		var $clickedSongNumber = parseInt($(this).attr('data-song-number'));

		
		if (currentSongNumber != null) {
			var $currentSongCell = getSongNumberCell(currentSongNumber);
			$currentSongCell = getSongNumberCell(currentSongNumber);
			$currentSongCell.html(currentSongNumber);
		}
		
		
		if (currentSongNumber != $clickedSongNumber) {

			setSong($clickedSongNumber);
			currentSoundFile.play();
            $clickedSongCell.html(pauseButtonTemplate);
			updateSeekPercentage($('.volume'), currentVolume / 100);
			updateSeekBarWhileSongPlays();
			updatePlayerBarSong();
		}
		else if (currentSongNumber == $clickedSongNumber) {
			if (currentSoundFile.isPaused()) {
				$clickedSongCell.html(pauseButtonTemplate);
				$('.main-controls .play-pause').html(playerBarPauseButton);
				currentSoundFile.play();		
				updateSeekBarWhileSongPlays();

			} else {
				$clickedSongCell.html(playButtonTemplate);
				$('.main-controls .play-pause').html(playerBarPlayButton);
				currentSoundFile.pause(); 
			}
		}
	};

	var onHover = function(event) {
		var songNumber = parseInt($(this).find('.song-item-number').attr('data-song-number'));

		if (songNumber != currentSongNumber) {
			$(this).find('.song-item-number').html(playButtonTemplate);
		}
	};
	var offHover = function(event) {
		var songNumber = parseInt($(this).find('.song-item-number').attr('data-song-number'));
		if (songNumber != currentSongNumber) {
			$(this).find('.song-item-number').html(songNumber);
		}
	};
	$row.find('.song-item-number').click(clickHandler);
	$row.hover(onHover, offHover);
	return $row;
};

var setCurrentAlbum = function(album) {
	currentAlbum = album;
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

var $albumTitle = $('.album-view-title');
var $albumArtist = $('.album-view-artist');
var $albumReleaseInfo = $('.album-view-release-info');
var $albumImage = $('.album-cover-art');
var $albumSongList = $('.album-view-song-list');

var updateSeekBarWhileSongPlays = function() {
	if (currentSoundFile) {
		currentSoundFile.bind('timeupdate', function(event) {
			var seekBarFillRatio = this.getTime() / this.getDuration();
			var $seekBar = $('.seek-control .seek-bar');
			
			updateSeekPercentage($seekBar, seekBarFillRatio);

			setCurrentTimeInPlayerBar(currentSoundFile.getTime());
		});
	}

};

var updateSeekPercentage = function($seekBar, seekBarfillRatio) {
	var offsetXpercent = seekBarfillRatio * 100;

	offsetXpercent = Math.max(0, offsetXpercent);
	offsetXpercent = Math.min(100, offsetXpercent);

	var percentageString = offsetXpercent + '%';
	$seekBar.find('.fill').width(percentageString);
	$seekBar.find('.thumb').css({left: percentageString});
};



var setupSeekBars = function() {
	var $seekBars = $('.player-bar .seek-bar');

	$seekBars.click(function(event) {
		var offsetX = event.pageX - $(this).offset().left;
		var barWidth = $(this).width();
		var seekBarFillRatio = offsetX / barWidth;
		  
		if ($(this).parent().hasClass('seek-control')) {
			seek(seekBarFillRatio * currentSoundFile.getDuration());
		
		} else {
			setVolume(seekBarFillRatio * 100);
		}
		
		updateSeekPercentage($(this), seekBarFillRatio);
	});
	
	$seekBars.find('.thumb').mousedown(function(event) {
		var $seekBar = $(this).parent();
		
		$(document).bind('mousemove.thumb', function(event) {
			var offsetX = event.pageX - $seekBar.offset().left;
			var barWidth = $seekBar.width();
			var seekBarFillRatio = offsetX / barWidth;
			
			if ($(this).parent().hasClass('seek-control')) {
				seek(seekBarFillRatio * currentSoundFile.getDuration());
			} else {
				setVolume(seekBarFillRatio * 100);
			}
			updateSeekPercentage($seekBar, seekBarFillRatio);
		});
		
		$(document).bind('mouseup.thumb', function() {
			$(document).unbind('mousemove.thumb');
			$(document).unbind('mouseup.thumb');
		});
	});
	
};

var toggleMute = function() {
	
	if (currentSoundFile.isMuted() == false) {
		currentSoundFile.mute();
		$(this).html(muteButton);
		console.log($(this));
		
	} else {
			currentSoundFile.unmute();
			$(this).html(volumeButton);
			
	}
};

var trackIndex = function(album, song) {
	return album.songs.indexOf(song);
}

var nextSong = function() {
	var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
	var previousSongNumber;

	
	if (currentSongIndex == currentAlbum.songs.length - 1) {
		previousSongNumber = currentSongIndex + 1;
		currentSongIndex = 0;

	} else {
		currentSongIndex += 1;
		previousSongNumber = currentSongIndex;
	}

	
	setSong(currentSongIndex + 1);
	currentSoundFile.play();
	updateSeekBarWhileSongPlays();
	
	updatePlayerBarSong();	
		getSongNumberCell(previousSongNumber).html(previousSongNumber);
	
	getSongNumberCell(currentSongNumber).html(pauseButtonTemplate);
};

var previousSong = function() {
	var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
	var previousSongNumber;

	
	if (currentSongIndex == 0) {
		previousSongNumber = 1;
		currentSongIndex = currentAlbum.songs.length - 1;
		
	} else {
		previousSongNumber = currentSongIndex + 1;
		currentSongIndex -= 1;
	}

	
	setSong(currentSongIndex + 1);
	currentSoundFile.play();
	updateSeekBarWhileSongPlays();
	
	updatePlayerBarSong();

	
	getSongNumberCell(previousSongNumber).html(previousSongNumber);
	
	getSongNumberCell(currentSongNumber).html(pauseButtonTemplate);
};

var togglePlayFromPlayerBar = function() {
	var $playPauseButton = $(this);


	if (currentSoundFile == null) {
		setSong(1);
	}
	if (currentSoundFile.isPaused()) {
		$playPauseButton.html(playerBarPauseButton);
		getSongNumberCell(currentSongNumber).html(pauseButtonTemplate);
		currentSoundFile.play();
		setCurrentTimeInPlayerBar(currentSoundFile.getTime());
		updateSeekBarWhileSongPlays();
		updatePlayerBarSong();
		updateSeekPercentage($('.volume'), currentVolume / 100);
	} else {
		$playPauseButton.html(playerBarPlayButton);
		getSongNumberCell(currentSongNumber).html(playButtonTemplate);
		currentSoundFile.pause();
	}
};


var updatePlayerBarSong = function() {
	$('.currently-playing .song-name').text(currentSongFromAlbum.title);
	$('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + ' - ' + currentAlbum.artist);
	$('.currently-playing .artist-name').text(currentAlbum.artist);

	$('.main-controls .play-pause').html(playerBarPauseButton);
	
	setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
};
var playButtonTemplate =
		'<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate =
		'<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var volumeButton = '<span class="ion-volume-high icon"></span>';
var muteButton = '<span class="ion-volume-mute icon"></span>';

var currentAlbum = null;
var currentSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $playPauseButton = $('.main-controls .play-pause');
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $volumeMuteButton = $('.volume-mute');

$(document).ready(function() {
	setCurrentAlbum(albumPicasso);
	setupSeekBars();
	$playPauseButton.click(togglePlayFromPlayerBar);
	$previousButton.click(previousSong);
	$nextButton.click(nextSong);
	$volumeMuteButton.click(toggleMute);
});