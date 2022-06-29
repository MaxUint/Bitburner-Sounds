Useful alias to toggle on/off
```
alias -g togglesound="home;run Bitburner-Sounds.js"
```

```js
    sound.bell()
    sound.speak('Hello World')
    sound.bell().speak('Chaining is possible but will occur all at once')
    sound.beep().speak('This is text to speach')
    //sound.beep options examples
    sound.beep({freq : 500})
    sound.beep({duration : 1000})
    sound.beep({type : 'sine'})
    sound.beep({gain : 0.2})
```

All are optional, you can declare a specific beep like this

```
import { sound } from 'Bitburner-Sounds.js'
/** @param {NS} ns */
export async function main(ns) {
    const lowTone = {freq : 420, type : 'sine', gain: 1}
    sound.beep(lowTone)
    const quiteLongHighTone = {freq : 840, gain: 0.1, duration : 5000}
    sound.beep(quiteLongHighTone).speak('Playing quite long high tone')
}
```

an example of making some chords!
```
import { sound } from 'Bitburner-Sounds.js'
/** @param {NS} ns */
export async function main(ns) {
    function playChord(tone) {
        const low = {freq : tone, duration : 50, type : 'square' , gain : 0.1}
        const middle = {freq : tone*1.3, duration : 50, type : 'square', gain : 0.1}
        const high = {freq : tone*1.5, duration : 50, type : 'square', gain : 0.1}
        sound.beep(low).beep(middle).beep(high)
    }
    let base = 500
    let delay = 0
    let chords = [base, base*1.3, base*0.5, base*0.8, base*0.1]

    globalThis['setTimeout'](()=>{
        for(let chord of chords) globalThis['setTimeout'](()=>{ playChord(chord); }, (delay+=100))
    }, 2000)
}
```
