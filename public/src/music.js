// step one of music generation is making the map between numbers and notes

// tempo for testing
const BPM = 160;

// notemap for numtotone func
let NoteMap = new Map([
    [0, "C"],
    [1, "C#"],
    [2, "D"],
    [3, "D#"],
    [4, "E"],
    [5, "F"],
    [6, "F#"],
    [7, "G"],
    [8, "G#"],
    [9, "A"],
    [10, "A#"],
    [11, "B"],
])

// Now I need a scale set that can be added to to form all the major and minor scales

let majBaseScale = [0,2,4,5,7,9,11];
let minBaseScale = [0,2,3,5,7,8,10];

// this function will generate other scales based on these sets

function scaleGenerator(type, root) {
    if (type == "maj") {
        let newMajScale = [];
        majBaseScale.forEach(note => {
            // mod 12 wraps this note around that way a 13 becomes a regular C instead of NAN
            let newNote = (note + root) % 12;
            newMajScale.push(newNote)
        });
        return newMajScale;
    } else {
        let newMinScale = [];
        minBaseScale.forEach(note => {
            // mod 12 wraps this note around that way a 13 becomes a regular C instead of NAN
            let newNote = (note + root) % 12;
            newMinScale.push(newNote)
        });
        return newMinScale;
    }
}

// maps a set of numbers to a tone
function NumToTone(num, oct) {
    let baseNote = NoteMap.get(num);
    return baseNote + oct;
}

function getRandomNumber(arr) {
  if (arr.length === 0) return undefined; // handle empty array
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

function noteFScale(type, root, octave) {
    let num = getRandomNumber(scaleGenerator(type, root));
    return NumToTone(num, octave)
}






// test sampler piano
const sampler = new Tone.Sampler({
	urls: {
		C4: "C4.mp3",
		"D#4": "Ds4.mp3",
		"F#4": "Fs4.mp3",
		A4: "A4.mp3",
	},
	release: 1,
	baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

// remember code to load sound events
// Tone.loaded().then(() => {
// 	sampler.triggerAttackRelease(["Eb4", "G4", "Bb4"], 4);
// });

// setting tempo

let min = 0;
let max = 11;


// Allow Audio Button
function AllowButton() {
    Tone.start();
    setInterval(() => {
        let note1 = noteFScale("min", 2, 4);
        sampler.triggerAttackRelease([note1], 1);
    }, 60000/BPM)
    setInterval(() => {
        let note1 = noteFScale("min", 2, 2);
        sampler.triggerAttackRelease([note1], 1);
    }, 60000/(BPM/2))
}






console.log("Music.js script loaded");