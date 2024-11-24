
// alarm home
const alarmHome = document.getElementById("alarmHome")
const currentDate = document.getElementById("topMiddle")
const currentTime = document.getElementById("clockTime")
const ampm = document.getElementById("ampm")
const alarmTime = document.getElementById("alarmTime")
const alarmContainer = document.getElementById("alarm")

// page selection menu
const pagesMenu = document.getElementById("pagesMenu")
const pagesBack = document.getElementById("pagesBack")
const pagesConfirm = document.getElementById("pagesConfirm")
const pages = [["setAlarm", "Set alarm"]]


/**
 * @typedef Alarm
 * @property {Number[]} time [Date.getHours(), Date.getMinutes()]
 * @property {Number[]} repeats Date.getDay() elements
 * @property {Number} lastPlayed Date.now(), used to make sure the alarm doesn't get spammed
 * @property {boolean} active Whether the alarm is currently active
 * @property {Number} interval The volume of the alarm fades in, this is the setInterval for that
 */

/**
 * Create a new alarm with the current time, repeating on the days specified
 * @param {Number[]} repeats An array of Date.getDay() elements
 * @returns {Alarm}
 */
function newAlarm(repeats) {
    const now = new Date()
    return {
        repeats: repeats,
        time: [now.getHours(), now.getMinutes()],
        lastPlayed: 0,
        active: true,
        interval: null
    }
}


/** @type {Alarm}*/
let alarmsSet = JSON.parse(window.localStorage.getItem("alarmsSet"))
/** @type {Alarm[]} */
let alarms = JSON.parse(window.localStorage.getItem("alarmData"))
/** @type {Audio[]} */
let currentlyPlayingAlarms = []
if (!alarms) window.localStorage.setItem("alarms", "[]")
if (!alarmsSet) window.localStorage.setItem("alarmsSet", "[]")



/**
 * @param {Number} hours Hours, 0-23
 * @returns 
 */
function formatHours(hours) {
    return hours > 12 ? hours % 12 : hours
}

/**
 * @param {Number} minutes Minutes, 0-60
 * @returns {String} Minutes, formatted to have a 0 in front if needed.
 */
function formatMinutes(minutes) {
    return minutes < 10 ? "0" + minutes : minutes
}

/**
 * sets the little display on the bottom
 * @param {Alarm} lastAlarm The latest alarm object activated
 */
function setNextAlarmDisplay(lastAlarm) {
    if (alarmsSet.length < 1) {
        alarmContainer.style.backgroundColor = "none"
    }
    let nextAlarm = lastAlarm.time.concat(99)
    alarmsSet.forEach((a, i) => {
        if (a.time[0] > nextAlarm[0] && a.time[1] > nextAlarm[1]) {
            let min = 99
            a.repeats.forEach((v) => {
                min = Math.min(v - now.getDay()) // find the soonest repeat date in that alarm, and check if it's sooner(or the same day) as the current one
            })
            if (min <= nextAlarm[2]) {
                nextAlarm = a.time.concat(min)
            }
        }
    })

    alarmTime.innerHTML = `${formatHours(nextAlarm[0])}:${formatMinutes(nextAlarm[1])} ${nextAlarm[0] >= 12 ? "pm" : "am"}` // set the time of the next alarm
}

alarms = [newAlarm([0,1,2,3,4,5,6])]
alarms[0].time[1] += 1
alarmsSet = [alarms[0]]
setNextAlarmDisplay(alarms[0])

const ws = new WebSocket("ws://localhost:" + (Number(window.location.port)+1))

ws.addEventListener("message", (event) => {
    console.log(event.data)
})




pagesBack.addEventListener("click", () => {
    pagesMenu.style.display = "none"
    alarmHome.style.display = "block"
    console.log("click")
})


setInterval(() => {
    const now = new Date()
    // todo: setting to change date format
    currentDate.innerHTML = `${now.getDate()}/${now.getMonth()}`
    currentTime.innerHTML = `${formatHours(now.getHours())}:${formatMinutes(now.getMinutes())}`
    ampm.innerHTML = now.getHours() > 12 ? "pm" : "am"


    alarmsSet.forEach(
        /**
         * 
         * @param {Alarm} alarm 
         * @param {Number} index 
         */
        (alarm, index) => {
        if (now.getHours() >= alarm.time[0] && now.getMinutes() >= alarm.time[1] && Date.now() - alarm.lastPlayed > (24 * 60 * 60 * 1000)) {
            alarm.lastPlayed = Date.now()
            alarm.active = true            
            const sound = new Audio("./assets/audio/C418 - Aria Math but it gets exponentially louder.mp3")

            currentlyPlayingAlarms.push(sound)

            sound.addEventListener("canplaythrough", (event) => {
                sound.play()
                // todo: snoozing and shutting off
                // sound.loop = true
                sound.volume = 0
                sound.interval = setInterval(() => {
                    sound.volume += 0.02
                    if (sound.volume >= 0.97) {
                        clearInterval(sound.interval)
                        sound.volume = 0.99
                    }
                },35)
                console.log("playing sound!!!!")
            })
            
            
            setNextAlarmDisplay(alarm)
        }
    })
}, 35)

