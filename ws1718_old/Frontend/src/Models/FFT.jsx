
export default class FFT {

	fft_mediaStream() {


		var getUserMedia = require('get-user-media-promise');
		var MicrophoneStream = require('microphone-stream');

		// note: for iOS Safari, the constructor must be called in response to a tap, or else the AudioContext will remain
		// suspended and will not provide any audio data.
		var micStream = new MicrophoneStream();

		getUserMedia({ video: false, audio: true })
		.then(function(stream) {

			var BUFF_SIZE_RENDERER = 16384;	

		    var audioContext = new AudioContext();

	        var gain_node = audioContext.createGain();
	        gain_node.connect( audioContext.destination );

	        var microphone_stream = audioContext.createMediaStreamSource(stream);
	        microphone_stream.connect(gain_node); 

	        var script_processor_node = audioContext.createScriptProcessor(BUFF_SIZE_RENDERER, 1, 1);
	        script_processor_node.onaudioprocess = function(event){
				var i, N, inp, microphone_output_buffer;
				microphone_output_buffer = event.inputBuffer.getChannelData(0); // just mono - 1 channel for now
			}

	        microphone_stream.connect(script_processor_node);

	        // --- enable volume control for output speakers

	        gain_node.gain.value = 0.5;

	        // --- setup FFT

	        var script_processor_analysis_node = audioContext.createScriptProcessor(2048, 1, 1);
	        script_processor_analysis_node.connect(gain_node);

	        var analyser_node = audioContext.createAnalyser();
	        analyser_node.smoothingTimeConstant = 0;
	        analyser_node.fftSize = 2048;

	        microphone_stream.connect(analyser_node);

	        analyser_node.connect(script_processor_analysis_node);

	        var buffer_length = analyser_node.frequencyBinCount;

	        var array_freq_domain = new Uint8Array(buffer_length);
	        var array_time_domain = new Uint8Array(buffer_length);

	        console.log("buffer_length " + buffer_length);

	        script_processor_analysis_node.onaudioprocess = function() {

	            // get the average for the first channel
	            analyser_node.getByteFrequencyData(array_freq_domain);
	            analyser_node.getByteTimeDomainData(array_time_domain);

				// draw the spectrogram
	            if (microphone_stream.playbackState == microphone_stream.PLAYING_STATE) {

            	    var size_buffer = array_freq_domain.length;
				    var index = 0;

				    console.log("__________ frequency");

			        for (; index < 8 && index < size_buffer; index += 1) {
			            console.log(array_freq_domain[index]);
			        }
	            }

	        };

			//this.start_microphone(stream);
		  	//micStream.setStream(stream);
		}).catch(function(error) {
		  console.log(error);
		});

		// get Buffers (Essentially a Uint8Array DataView of the same Float32 values)
		micStream.on('data', function(chunk) {
		// Optionally convert the Buffer back into a Float32Array
		// (This actually just creates a new DataView - the underlying audio data is not copied or modified.)
		var raw = MicrophoneStream.toRaw(chunk)

		console.log(chunk);


		/*var microphone_stream = audio_context.createMediaStreamSource(chunk);
		*/


		// note: if you set options.objectMode=true, the `data` event will output AudioBuffers instead of Buffers
		});

		// or pipe it to another stream
		//micStream.pipe(/*...*/);

		// It also emits a format event with various details (frequency, channels, etc)
		micStream.on('format', function(format) {
		console.log(format);
		});
	 

	}

	show_some_data(given_typed_array, num_row_to_display, label) {

	    var size_buffer = given_typed_array.length;
	    var index = 0;

	    console.log("__________ " + label);

	    if (label === "time") {

	        for (; index < num_row_to_display && index < size_buffer; index += 1) {

	            var curr_value_time = (given_typed_array[index] / 128) - 1.0;

	            console.log(curr_value_time);
	        }

	    } else if (label === "frequency") {

	        for (; index < num_row_to_display && index < size_buffer; index += 1) {

	            console.log(given_typed_array[index]);
	        }

	    } else {

	        throw new Error("ERROR - must pass time or frequency");
	    }
    }

}