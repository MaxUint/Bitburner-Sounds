/*
    run Bitburner-Sounds.js
    Author Zombean
    Examples
    run Bitburner-Sounds.js
    to disable just re-run the script

*/

/* SETTINGS */
/* GAINS DECIMAL 0 - 1 */
const musicGain = 1
const fadeOutOnUnFocus = true
const fadeOutSpeed = .0001
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

    globalThis.BitburnerSounds = globalThis?.BitburnerSounds ?? ({disabled : false, gainNodes : {}, cache : {}, isTyping : 0, typewriteTimeout : 0}) 
    
    globalThis.BitburnerSounds.urlMap = urlMap
    
    if(globalThis.BitburnerSounds?.AudioContext?.state != undefined) {
        let isOn = globalThis.BitburnerSounds.AudioContext.state == 'running'
        globalThis.BitburnerSounds.isOn = !isOn
        globalThis.BitburnerSounds.AudioContext[(isOn?'suspend':'resume')]()
        return ns.tprint(`${isOn?'WARN:':'INFO'} Bitburner-Sounds ${isOn ? 'paused' : 'resumed'}`)
    }
    
    ns.tprint('INFO: INITIALIZING SOUNDS')

    globalThis.BitburnerSounds.isOn = true

    globalThis.BitburnerSounds.AudioContext = new (globalThis['window']?.AudioContext ?? globalThis['window']?.webkitAudioContext)()
    globalThis.BitburnerSounds.masterGain = globalThis.BitburnerSounds.AudioContext.createGain()
    globalThis.BitburnerSounds.masterGain.gain.value = 1
    globalThis.BitburnerSounds.masterGain['connect'](globalThis.BitburnerSounds.AudioContext.destination)

    globalThis.BitburnerSounds.play = async (url, gain = 1) => {
        gain *= masterGain
        if(!globalThis.BitburnerSounds.isOn) return
        if(globalThis.BitburnerSounds.cache[url] === undefined) {
            let response = await fetch(url)
            let dataArray = await response.arrayBuffer()
            let buffer = await globalThis.BitburnerSounds.AudioContext.decodeAudioData(dataArray)
            globalThis.BitburnerSounds.gainNodes[url] = globalThis.BitburnerSounds.AudioContext.createGain()
            globalThis.BitburnerSounds.gainNodes[url].gain.value = gain
            globalThis.BitburnerSounds.gainNodes[url]['connect'](globalThis.BitburnerSounds.masterGain)
            globalThis.BitburnerSounds.cache[url] = buffer
        }
        let bufferSource = globalThis.BitburnerSounds.AudioContext.createBufferSource()
        bufferSource.buffer = globalThis.BitburnerSounds.cache[url]
        bufferSource['connect'](globalThis.BitburnerSounds.gainNodes[url])
        bufferSource.start(0)
    }

    globalThis.BitburnerSounds.loop = async(url, gain = 1) => {
        gain *= masterGain
        if(globalThis.BitburnerSounds.gainNodes[url]) {
            let isSilent = gainNodes[url].gain.value == 0
            gainNodes[url].gain.value = isSilent ? gain : 0
            return
        }

        globalThis.BitburnerSounds.gainNodes[url] = globalThis.BitburnerSounds.AudioContext.createGain()
        globalThis.BitburnerSounds.gainNodes[url].gain.value = gain
        globalThis.BitburnerSounds.gainNodes[url]['connect'](globalThis.BitburnerSounds.masterGain)
        let bufferSource = globalThis.BitburnerSounds.AudioContext.createBufferSource()
        let response = await fetch(url)
        let dataArray = await response.arrayBuffer()
        let buffer = await globalThis.BitburnerSounds.AudioContext.decodeAudioData(dataArray)
        bufferSource.buffer = buffer
        bufferSource.loop = true
        bufferSource['connect'](globalThis.BitburnerSounds.gainNodes[url])
        bufferSource.start(0)
    }

    globalThis.BitburnerSounds.terminalType = () => {
        globalThis['clearTimeout'](globalThis.BitburnerSounds.typewriteTimeout)
        globalThis.BitburnerSounds.gainNodes[globalThis.BitburnerSounds.urlMap.URL_TYPING].gain.value = 1 * terminalTyperWriterGain
        globalThis['setTimeout'](globalThis.BitburnerSounds.terminalStopped, 100)
    }

    globalThis.BitburnerSounds.bind2elements = (selector, sound, gain = 1) => {
        for (const button of globalThis['document'].querySelectorAll(selector)) {
            if(button === undefined) continue
            if(button?.hasSound) continue
            button.addEventListener('click', ()=>{
                globalThis.BitburnerSounds.play(sound, gain)
            })
            button.hasSound = true
        }
    }

    globalThis.BitburnerSounds.terminalStopped = () => {
        globalThis.BitburnerSounds.gainNodes[globalThis.BitburnerSounds.urlMap.URL_TYPING].gain.value = 0
    }
    
    globalThis.BitburnerSounds.bindEnforcer = () => {

        globalThis.BitburnerSounds.bind2elements('.MuiTouchRipple-root', globalThis.BitburnerSounds.urlMap.URL_SWIPE, 0.3)
        globalThis.BitburnerSounds.bind2elements('.MuiListItem-button' , globalThis.BitburnerSounds.urlMap.URL_LONGCLICK, 0.2)
        globalThis.BitburnerSounds.bind2elements('.MuiButton-sizeMedium', globalThis.BitburnerSounds.urlMap.URL_CLICK, 2)
        globalThis.BitburnerSounds.bind2elements('div[role=button]', globalThis.BitburnerSounds.urlMap.URL_POP, 0.1)
        globalThis.BitburnerSounds.bind2elements('button', globalThis.BitburnerSounds.urlMap.URL_POP, 0.1)
        globalThis.BitburnerSounds.bind2elements('span[aria-label]', globalThis.BitburnerSounds.urlMap.URL_SWIPE, 0.3)
        
        let terminal = globalThis['document'].getElementById('terminal-input')
        if(!terminal) return
        if(terminal?.hasSounds) return
        terminal.addEventListener('input', globalThis.BitburnerSounds.terminalType)
        terminal.hasSounds = true
    }

    globalThis['setInterval'](globalThis.BitburnerSounds.bindEnforcer, 100)
    await globalThis.BitburnerSounds.loop(globalThis.BitburnerSounds.urlMap.URL_SERVER_RACK, 0.7 * serverRackFansGain)
    await globalThis.BitburnerSounds.loop(globalThis.BitburnerSounds.urlMap.URL_SERVER_FANS, 0.25 * serverRackFansGain)
    await globalThis.BitburnerSounds.loop(globalThis.BitburnerSounds.urlMap.URL_TYPING, 0)
    await globalThis.BitburnerSounds.play(globalThis.BitburnerSounds.urlMap.URL_DIALUP, 0.1)
    await globalThis.BitburnerSounds.loop(globalThis.BitburnerSounds.urlMap.URL_SERVER_AIR, 0.3 * serverRackFansGain)
    await globalThis.BitburnerSounds.loop(globalThis.BitburnerSounds.urlMap.URL_SONG, (1/6) * musicGain)

    globalThis['setInterval'](()=>{globalThis.BitburnerSounds.play(globalThis.BitburnerSounds.urlMap.URL_DIALUP, 0.1 * dialUpTonesGain)}, 1000*60*3)
	
  

    ns.tprint('INFO: Bitburner-Sounds enabled')


    globalThis.BitburnerSounds.gainSlide = 1
    if(fadeOutOnUnFocus) globalThis['setInterval'](()=>{
        
        let focus = globalThis['document'].hasFocus() 
        globalThis.BitburnerSounds.gainSlide += focus ? .1 : -fadeOutSpeed
        if(globalThis.BitburnerSounds.gainSlide >= 1) globalThis.BitburnerSounds.gainSlide = 1
        if(globalThis.BitburnerSounds.gainSlide <= .01) globalThis.BitburnerSounds.gainSlide = .01
        globalThis.BitburnerSounds.masterGain.gain.value = globalThis.BitburnerSounds.gainSlide
        globalThis.BitburnerSounds.gainNodes[globalThis.BitburnerSounds.urlMap.URL_SONG].gain.value = (globalThis.BitburnerSounds.gainSlide/6) * musicGain
    }, 50)
}

export const sound = {timeout : 0}

sound.speak = (string) => { 
    let utterance = new SpeechSynthesisUtterance(string)
    speechSynthesis.speak(utterance)
    return sound
}
sound.bell = () => { sound.makeSound("https://freesound.org/data/previews/299/299147_2050105-lq.mp3"); return sound }
sound.click = () => { sound.makeSound('https://cdn.freesound.org/previews/243/243772_3255970-lq.mp3'); return sound }

sound.makeSound = async (soundUrl, loop = false) => { 
    if(!globalThis?.audioCache) globalThis.audioCache = {}
    if(!globalThis?.gAudioCtx) globalThis.gAudioCtx = new (globalThis['window'].AudioContext ?? globalThis['window'].webkitAudioContext)()

    globalThis['clearTimeout'](sound.timeout)
    sound.timeout = globalThis['setTimeout'](()=> {
        globalThis.gAudioCtx = new (globalThis['window'].AudioContext ?? globalThis['window'].webkitAudioContext)()
    }, 1000) //refresh audio context to reduce potential jitter after lots of buffers

    let bufferSource = globalThis.gAudioCtx.createBufferSource()
    if(!globalThis.audioCache[soundUrl]) {
        let response = await fetch(soundUrl)
        let dataArray = await response.arrayBuffer()
        let buffer = await globalThis.gAudioCtx.decodeAudioData(dataArray)
        globalThis.audioCache[soundUrl] = buffer
    }
    bufferSource.buffer = globalThis.audioCache[soundUrl]
    bufferSource.loop = loop
    bufferSource['connect'](globalThis.gAudioCtx.destination)
    bufferSource.start(0)
} 

sound.beep = ({freq, type, duration, gain} = {}) => {
    if(!freq) freq = 800
    if(!type) type = 'sine'
    if(!duration) duration = 50
    if(!gain) gain = 0.5
    globalThis['beepContexts'] = globalThis['beepContexts'] ?? {}
    if(!globalThis['beepContexts'][[freq, type]]) {
        let context = new (globalThis['window'].AudioContext ?? globalThis['window'].webkitAudioContext)()
        let oscillator = context.createOscillator()
        let gainNode = context.createGain()
        gainNode['connect'](context.destination)
        oscillator.type = type
        oscillator.frequency.value = freq
        oscillator['connect'](gainNode)
        gainNode.gain.value = 0
        oscillator.start(0)
        globalThis['beepContexts'][[freq, type]] = gainNode
    }
    globalThis['beepContexts'][[freq, type]].gain.value = 0
    globalThis['setTimeout'](()=>{
        globalThis['beepContexts'][[freq, type]].gain.value = gain
    }, duration>=100?50:0)
    globalThis['clearTimeout'](globalThis['beepContexts'][[freq, type]].timeout)
    globalThis['beepContexts'][[freq, type]].timeout = globalThis['setTimeout'](()=>{
        globalThis['beepContexts'][[freq, type]].gain.value = 0
    }, duration)

    return sound
}