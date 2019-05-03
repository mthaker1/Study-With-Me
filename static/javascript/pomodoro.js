class PomodoroApp extends React.Component {


  constructor(props){
    super(props)

    this.modeSeconds = {
      "pomodoro": 25*60,
      "shortBreak": 5*60,
      "longBreak": 10*60
    }

    this.modeTime = {
      "pomodoro": JSON.stringify({"h":0,"m":25,"s":0}),
      "shortBreak": JSON.stringify({"h":0,"m":5,"s":0}),
      "longBreak": JSON.stringify({"h":0,"m":10,"s":0})
    }

    this.state = {
      mode: "pomodoro",
      time: JSON.stringify({"h":0,"m":25,"s":0}),
      seconds: 25*60,
      timerMode:"pomodoroReset"
    }
    this.timer = 0

    this.modeChange = this.modeChange.bind(this)
    this.timeModeChange = this.timeModeChange.bind(this)
    this.changeTime = this.changeTime.bind(this)
    this.startTimer = this.startTimer.bind(this)
    this.countDown = this.countDown.bind(this)

  }


  modeChange = (targetId) => {
    this.setState({mode:targetId,time: this.modeTime[targetId], seconds: this.modeSeconds[targetId]});
    this.timer  = 0;
  }

  timeModeChange = (targetId) => {
    this.setState({timerMode:targetId})
    if(targetId == "pomodoroStart"){
      this.startTimer();
    }
    else if(targetId == "pomodoroStop"){
      this.stopTimer();
    }
    else if(targetId == "pomodoroReset"){
      this.resetTimer();
    }

  }

  changeTime = (targetId) => {

    if(targetId == "addTime" && this.state.seconds <= 59*60){
      this.modeSeconds[this.state.mode] += 60;
      this.modeTime[this.state.mode] = this.secondsToTime(this.modeSeconds[this.state.mode]);
      this.setState({time:this.modeTime[this.state.mode],seconds:this.modeSeconds[this.state.mode]});
    }
    else if(targetId == "minusTime" && this.state.seconds >= 0){
      this.modeSeconds[this.state.mode] -= 60;
      this.modeTime[this.state.mode] = this.secondsToTime(this.modeSeconds[this.state.mode]);
      this.setState({time:this.modeTime[this.state.mode],seconds:this.modeSeconds[this.state.mode]});
    }
  }

  secondsToTime = (secs) => {
    let hours = Math.floor(secs / (60 * 60));

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    let obj = {
      "h": hours,
      "m": minutes,
      "s": seconds
    };
    return JSON.stringify(obj);
  }

  startTimer = () => {
    if (this.state.seconds > 0) {
      this.timer = setInterval(this.countDown, 1000);
    }
  }

  stopTimer = () => {
    clearInterval(this.timer);
  }

  resetTimer = () => {
    this.stopTimer();
    this.setState({time:this.modeTime[this.state.mode],seconds:this.modeSeconds[this.state.mode]})
  }

  countDown = () => {
    // Remove one second, set state so a re-render happens.
    let seconds = this.state.seconds - 1;
    this.setState({
      time: this.secondsToTime(seconds),
      seconds: seconds,
    });

    // Check if we're at zero.
    if (seconds == 0) {
      clearInterval(this.timer);
    }
  }

  cleanFormat = (timeObj) => {
    let obj = JSON.parse(timeObj);
    let timeString = obj.m + ":" + ("0" + obj.s).slice(-2);
    return timeString;
  }

  render(){
    return (
      <div id="pomodoroEntirePage">
        <div id="pomodoroPageTopLayer">
          <span id = "pomodoroPageTitle">Pomodoro Clock</span>
        </div>


        <br/>
        <br/>

        <div className = "text-center">
          <button onClick={e => this.modeChange(e.target.id)} className = "btn btn-primary pomodoroLongButton" id = "pomodoro">Pomodoro </button>
          <button onClick={e => this.modeChange(e.target.id)} className = "btn btn-primary pomodoroLongButton" id = "shortBreak">Short Break</button>
          <button onClick={e => this.modeChange(e.target.id)} className = "btn btn-primary pomodoroLongButton" id = "longBreak">Long Break </button>

          <br/>

          <p id = "pomodoroTimeChange">
            <button onClick={e => this.changeTime(e.target.id)} className = "btn btn-primary" id = "pomodoroAddTime">+</button>
            Edit Time
            <button onClick={e => this.changeTime(e.target.id)} className = "btn btn-primary" id = "pomodoroMinusTime">-</button>
          </p>

          <p id = "pomodoroTimer">{this.cleanFormat(this.state.time)}</p>

          <br/>
          <br/>

          <button onClick={e => this.timeModeChange(e.target.id)} className = "btn btn-primary pomodoroLargeButton" id = "pomodoroStart">Start</button>
          <button onClick={e => this.timeModeChange(e.target.id)} className = "btn btn-primary pomodoroLargeButton" id = "pomodoroStop">Stop</button>
          <button onClick={e => this.timeModeChange(e.target.id)} className = "btn btn-primary pomodoroLargeButton" id = "pomodoroReset">Reset</button>
        </div>
      </div>
    )
  }

}

ReactDOM.render(
  <PomodoroApp />,
  document.getElementById("pomodoroPageContainer")
);
