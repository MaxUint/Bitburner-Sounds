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