/*
    run Bitburner-Sounds.js
    Author Zombean
    Examples
    run Bitburner-Sounds.js
    to disable just re-run the script

*/

/* SETTINGS */
/* GAINS DECIMAL 0 - 1 */
const musicGain = 0.35
const fadeOutOnUnFocus = true
const fadeOutSpeed = .00025
const serverRackFansGain = 1
const dialUpTonesGain = 1
const terminalTyperWriterGain = 1
const masterGain = 1

/* SOUNDS IN SCRIPTS */
/*

import { sound } from 'Bitburner-Sounds.js'

sound.bell()
sound.speak('Hello World')
sound.bell().speak('Chaining is possible but will occur all at once')
sound.beep()
sound.beep().speak('This is text to speach')

sound.beep options examples
sound.beep({freq : 500})
sound.beep({duration : 1000})
sound.beep({type : 'sine'})
sound.beep({gain : 0.2})

All are optional, you can declare a specific beep like this

const lowTone = {freq : 420, type : 'sine', gain: 1}
sound.beep(lowTone)

const quiteLongHighTone = {freq : 840, gain: 0.1, duration : 5000}
sound.beep(quiteLongHighTone).speak('Playing quite long high tone')

*/

/** @param {NS} ns */
export async function main(ns) {
    const urlMap = {}
    urlMap['URL_SONG']  = `https://raw.githubusercontent.com/frogbean/Bitburner-Sounds/main/sounds/HypnocityReverb.mp3`
    urlMap['URL_CLICK'] = `https://raw.githubusercontent.com/frogbean/Bitburner-Sounds/main/sounds/click.mp3`
    urlMap['URL_SWIPE'] = 'https://raw.githubusercontent.com/frogbean/Bitburner-Sounds/main/sounds/swipe.mp3'
    urlMap['URL_TYPING']  = 'https://raw.githubusercontent.com/frogbean/Bitburner-Sounds/main/sounds/typing.mp3'
    urlMap['URL_DIALUP'] = 'https://raw.githubusercontent.com/frogbean/Bitburner-Sounds/main/sounds/dialup.mp3'
    urlMap['URL_SERVER_AIR'] =  'https://raw.githubusercontent.com/frogbean/Bitburner-Sounds/main/sounds/server_air.mp3'
    urlMap['URL_SERVER_RACK'] = 'https://raw.githubusercontent.com/frogbean/Bitburner-Sounds/main/sounds/server_rack.mp3'
    urlMap['URL_SERVER_FANS'] = 'https://raw.githubusercontent.com/frogbean/Bitburner-Sounds/main/sounds/server_fans.mp3'
    urlMap['URL_LONGCLICK'] = 'https://raw.githubusercontent.com/frogbean/Bitburner-Sounds/main/sounds/longclick.mp3'
    urlMap['URL_POP'] = 'https://raw.githubusercontent.com/frogbean/Bitburner-Sounds/main/sounds/pop.mp3'
	urlMap['URL_CYBER'] = 'https://raw.githubusercontent.com/frogbean/Bitburner-Sounds/main/sounds/cyberroom.mp3'

    globalThis.BitburnerSounds ??= ({disabled : false, gainNodes : {}, cache : {}, isTyping : 0, typewriteTimeout : 0}) 
    
    BitburnerSounds.urlMap = urlMap
    
    if(BitburnerSounds?.AudioContext?.state != undefined) {
        let isOn = BitburnerSounds.AudioContext.state == 'running'
        BitburnerSounds.isOn = !isOn
        BitburnerSounds.AudioContext[(isOn?'suspend':'resume')]()
        return ns.tprint(`${isOn?'WARN:':'INFO'} Bitburner-Sounds ${isOn ? 'paused' : 'resumed'}`)
    }
    
    ns.tprint('INFO: INITIALIZING SOUNDS')

    let newAudioContext = () => new (globalThis?.AudioContext ?? globalThis?.webkitAudioContext)() 

    BitburnerSounds.isOn = true

    BitburnerSounds.AudioContext = newAudioContext()
    BitburnerSounds.masterGain = BitburnerSounds.AudioContext.createGain()
    BitburnerSounds.masterGain.gain.value = 1
    BitburnerSounds.masterGain['connect'](BitburnerSounds.AudioContext.destination)

    BitburnerSounds.play = async (url, gain = 1) => {
        gain *= masterGain
        if(!BitburnerSounds.isOn) return
        if(BitburnerSounds.cache[url] === undefined) {
            let response = await fetch(url)
            let dataArray = await response.arrayBuffer()
            let buffer = await BitburnerSounds.AudioContext.decodeAudioData(dataArray)
            BitburnerSounds.gainNodes[url] = BitburnerSounds.AudioContext.createGain()
            BitburnerSounds.gainNodes[url].gain.value = gain
            BitburnerSounds.gainNodes[url]['connect'](BitburnerSounds.masterGain)
            BitburnerSounds.cache[url] = buffer
        }
        let bufferSource = BitburnerSounds.AudioContext.createBufferSource()
        bufferSource.buffer = BitburnerSounds.cache[url]
        bufferSource['connect'](BitburnerSounds.gainNodes[url])
        bufferSource.start(0)
    }

    BitburnerSounds.loop = async(url, gain = 1) => {
        gain *= masterGain
        if(BitburnerSounds.gainNodes[url]) {
            let isSilent = gainNodes[url].gain.value == 0
            gainNodes[url].gain.value = isSilent ? gain : 0
            return
        }

        BitburnerSounds.gainNodes[url] = BitburnerSounds.AudioContext.createGain()
        BitburnerSounds.gainNodes[url].gain.value = gain
        BitburnerSounds.gainNodes[url]['connect'](BitburnerSounds.masterGain)
        let bufferSource = BitburnerSounds.AudioContext.createBufferSource()
        let response = await fetch(url)
        let dataArray = await response.arrayBuffer()
        let buffer = await BitburnerSounds.AudioContext.decodeAudioData(dataArray)
        bufferSource.buffer = buffer
        bufferSource.loop = true
        bufferSource['connect'](BitburnerSounds.gainNodes[url])
        bufferSource.start(0)
    }

    BitburnerSounds.terminalType = () => {
        clearTimeout(BitburnerSounds.typewriteTimeout)
        BitburnerSounds.gainNodes[BitburnerSounds.urlMap.URL_TYPING].gain.value = 1 * terminalTyperWriterGain
        setTimeout(BitburnerSounds.terminalStopped, 100)
    }

    BitburnerSounds.bind2elements = (selector, sound, gain = 1) => {
        for (const button of globalThis['document'].querySelectorAll(selector)) {
            if(button === undefined) continue
            if(button?.hasSound) continue
            button.addEventListener('click', ()=>{
                BitburnerSounds.play(sound, gain)
            })
            button.hasSound = true
        }
    }

    BitburnerSounds.terminalStopped = () => {
        BitburnerSounds.gainNodes[BitburnerSounds.urlMap.URL_TYPING].gain.value = 0
    }
    
    BitburnerSounds.bindEnforcer = () => {

        BitburnerSounds.bind2elements('.MuiTouchRipple-root', BitburnerSounds.urlMap.URL_SWIPE, 0.3)
        BitburnerSounds.bind2elements('.MuiListItem-button' , BitburnerSounds.urlMap.URL_LONGCLICK, 0.2)
        BitburnerSounds.bind2elements('.MuiButton-sizeMedium', BitburnerSounds.urlMap.URL_CLICK, 2)
        BitburnerSounds.bind2elements('div[role=button]', BitburnerSounds.urlMap.URL_POP, 0.1)
        BitburnerSounds.bind2elements('button', BitburnerSounds.urlMap.URL_POP, 0.1)
        BitburnerSounds.bind2elements('span[aria-label]', BitburnerSounds.urlMap.URL_SWIPE, 0.3)
        
        let terminal = globalThis['document'].getElementById('terminal-input')
        if(!terminal) return
        if(terminal?.hasSounds) return
        terminal.addEventListener('input', BitburnerSounds.terminalType)
        terminal.hasSounds = true
    }

    setInterval(BitburnerSounds.bindEnforcer, 100)
    await BitburnerSounds.loop(BitburnerSounds.urlMap.URL_SERVER_RACK, 0.7 * serverRackFansGain)
    await BitburnerSounds.loop(BitburnerSounds.urlMap.URL_SERVER_FANS, 0.25 * serverRackFansGain)
    await BitburnerSounds.loop(BitburnerSounds.urlMap.URL_TYPING, 0)
    await BitburnerSounds.play(BitburnerSounds.urlMap.URL_DIALUP, 0.1)
    await BitburnerSounds.loop(BitburnerSounds.urlMap.URL_SERVER_AIR, 0.3 * serverRackFansGain)
    await BitburnerSounds.loop(BitburnerSounds.urlMap.URL_SONG, (1/6) * musicGain)
	await BitburnerSounds.loop(BitburnerSounds.urlMap.URL_CYBER, 0.5)

    setInterval(()=>{BitburnerSounds.play(BitburnerSounds.urlMap.URL_DIALUP, 0.1 * dialUpTonesGain)}, 1000*60*3)
	
  

    ns.tprint('INFO: Bitburner-Sounds enabled')


    BitburnerSounds.gainSlide = 1
    if(fadeOutOnUnFocus) setInterval(()=>{
        
        let focus = globalThis['document'].hasFocus() 
        BitburnerSounds.gainSlide += focus ? .1 : -fadeOutSpeed
        if(BitburnerSounds.gainSlide >= 1) BitburnerSounds.gainSlide = 1
        if(BitburnerSounds.gainSlide <= .01) BitburnerSounds.gainSlide = .01
        BitburnerSounds.masterGain.gain.value = BitburnerSounds.gainSlide
        BitburnerSounds.gainNodes[BitburnerSounds.urlMap.URL_SONG].gain.value = (BitburnerSounds.gainSlide/6) * musicGain
    }, 50)
}

export const sound = {timeout : 0}

sound.speak = (string) => { 
    let utterance = new SpeechSynthesisUtterance(string)
    utterance.pitch = 0
    speechSynthesis.speak(utterance)
    return sound
}
sound.bell = () => { sound.makeSound("https://freesound.org/data/previews/299/299147_2050105-lq.mp3"); return sound }
sound.click = () => { sound.makeSound('https://cdn.freesound.org/previews/243/243772_3255970-lq.mp3'); return sound }

sound.makeSound = async (soundUrl, loop = false) => { 
    globalThis.audioCache ??= {}
    globalThis.gAudioCtx ??= newAudioContext()

    clearTimeout(sound.timeout)
    sound.timeout = setTimeout(()=> {
        gAudioCtx = newAudioContext()
    }, 1000) //refresh audio context to reduce potential jitter after lots of buffers

    let bufferSource = gAudioCtx.createBufferSource()
    if(!audioCache[soundUrl]) {
        let response = await fetch(soundUrl)
        let dataArray = await response.arrayBuffer()
        let buffer = await gAudioCtx.decodeAudioData(dataArray)
        audioCache[soundUrl] = buffer
    }
    bufferSource.buffer = audioCache[soundUrl]
    bufferSource.loop = loop
    bufferSource['connect'](gAudioCtx.destination)
    bufferSource.start(0)
} 

sound.beep = ({freq = 800, type = 'sine', duration = 50, gain = 0.5} = {}) => {
    console.log(freq)
    if(!isFinite(freq)) return console.error('none finite freq')
    freq = Math.round(freq)
    globalThis.beepChannels ??= {}
    globalThis.beepContext ??= newAudioContext()
    if(!beepChannels[[freq, type]]) {
        let oscillator = beepContext.createOscillator()
        let gainNode = beepContext.createGain()
        gainNode['connect'](beepContext.destination)
        oscillator.type = type
        oscillator.frequency.value = freq
        oscillator['connect'](gainNode)
        gainNode.gain.value = 0
        oscillator.start(0)
        beepChannels[[freq, type]] = gainNode
    }
    beepChannels[[freq, type]].gain.value = 0
    setTimeout(()=>{
        beepChannels[[freq, type]].gain.value = gain
    }, duration>=100?50:0)
    clearTimeout(beepChannels[[freq, type]].timeout)
    beepChannels[[freq, type]].timeout = setTimeout(()=>{
        beepChannels[[freq, type]].gain.value = 0
    }, duration)

    return sound
}