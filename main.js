var start_timer_seconds = 120;
var current_timer

var timer_complete_interval
var interval
var timer_paused
var timer_is_complete = 0
var input_minutes = ''
var timer_complete_count = 0

var default_background_color = ''
var default_foreground_color = 'rgb(0,0,0)'
var alt_background_color = 'rgb(255, 0, 0)'
var alt_foreground_color = 'rgb(100, 100, 100)'

function toggle_colors(target, prop, color1, color2){
    current_val = document.querySelector(target).style[prop]

    //console.log('current_val is', current_val)
    if (current_val != color1){
        document.querySelector(target).style[prop] = color1
    } else {
        document.querySelector(target).style[prop] = color2
    }
}

function update_fill(){
    var percent = 1 - current_timer / start_timer_seconds
    document.querySelector('#fill').style['width'] = percent * 100 + '%'
    if (percent == 1){
        document.querySelector('#fill').style['display'] = 'none'
    } else {
        document.querySelector('#fill').style['display'] = 'block'
    }
}

function timer_complete(){
    clearInterval(interval)
    timer_is_complete = 1

    if (play_audio_on_complete){
        var audio = new Audio('ding.mp3');
        audio.play();
    }

    timer_complete_interval = setInterval(function(){
        toggle_colors('#timer', 'background', alt_background_color, default_foreground_color)
        toggle_colors('#timer-value', 'color', default_background_color, alt_foreground_color)
        if (timer_complete_count % 2 == 0){
            document.title = '-----'
        } else {
            document.title = 'DONE!'
        }
        timer_complete_count++
    }, 1000)
}

function str_pad_left(string,pad,length) {
    return (new Array(length+1).join(pad)+string).slice(-length);
}

function format_time(seconds){
    var minutes = Math.floor(seconds / 60)
    var seconds_remaining = seconds % 60
    var final_time = str_pad_left(minutes,'0',2) + ':' + str_pad_left(seconds_remaining,'0',2);
    return final_time
}

function set_timer(minutes){
    start_timer_seconds = minutes * 60
    current_timer = start_timer_seconds
    start_timer()
    timer_is_complete = 0
}

function reset_and_restart_timer(){
    reset_timer()
    start_timer()
}

function reset_timer(){
    clearInterval(timer_complete_interval)
    clearInterval(interval)

    document.querySelector('#timer').style['background'] = default_background_color
    document.querySelector('#timer-value').style['color'] = default_foreground_color

    current_timer = start_timer_seconds
    update_timer(current_timer)
    timer_is_complete = 0
}

function show_input_minutes(){
    document.querySelector('#input-minutes').innerHTML = input_minutes + ' mins'
    document.querySelector('#input-minutes').style.display = 'flex'
}

function open_config(){
    // store the window size and location so we can restore it after the user is done with the config view
    window_height = window.innerHeight
    window_width = window.innerWidth
    window_x = window.screenLeft
    window_y = window.screenTop

    // resize the window
    var width = 380
    var height = 400
    window.resizeTo(width, height);

    // show the config div
    document.querySelector('#config').style.display = 'block'

    config_is_showing = 1
}

function close_config(){
    console.log('close the config')

    // save the config data
    save_config()

    // hide the config div
    document.querySelector('#config').style.display = 'none'

    // retrieve the stored, previous window size an x/y and restore the window to this size
    window.resizeTo(window_width, window_height)
    window.moveTo(window_x, window_y)

    config_is_showing = 0
}

function open_task(){
    // store the window size and location so we can restore it after the user is done with the config view
    window_height = window.innerHeight
    window_width = window.innerWidth
    window_x = window.screenLeft
    window_y = window.screenTop

    // resize the window
    var width = 380
    var height = 400
    window.resizeTo(width, height);

    // show the config div
    document.querySelector('#task-list').style.display = 'block'

    // select the add task field
    document.getElementById('add_task_form').new_task.focus();

    task_is_showing = 1
}

function close_task(){
    console.log('close the task list')

    // save the config data
    save_config()

    // hide the config div
    document.querySelector('#task-list').style.display = 'none'

    // retrieve the stored, previous window size an x/y and restore the window to this size
    window.resizeTo(window_width, window_height)
    window.moveTo(window_x, window_y)

    task_is_showing = 0
}

function catch_keypress(e){
    // while task list is showing, ignore key catching
    if (task_is_showing){
        return true
    }

    // reset current timer
    if (e.key == 'r' || e.key == 'R'){
        reset_and_restart_timer()
    }

    // pause current timer
    if (e.key == 'p' || e.key == 'P' || e.code === 'Space'){
        if (timer_paused){
            start_timer()
        } else {
            pause_timer()
        }
    }

    // start new timer
    if (e.key == 'Enter' || e.key == 'Return'){
        set_timer(input_minutes)
        reset_and_restart_timer()
        document.querySelector('#input-minutes').style.display = 'none'
        input_minutes = ''
    }

    // set new timer
    var set_timer_keys = ['0','1','2','3','4','5','6','7','8','9']
    if (set_timer_keys.indexOf(e.key) != -1){
        //console.log('set timer key ', e.key)
        //pause_timer();
        clearInterval(interval)
        input_minutes += e.key
        show_input_minutes()
    }

    // set test timer
    if (e.key == '^'){
        clearInterval(interval)
        input_minutes += 0.1
        show_input_minutes()
    }

    // toggle config mode
    var open_config_keys = ['?']
    if (open_config_keys.indexOf(e.key) != -1){
        console.log('enter config mode')
        if (config_is_showing){
            close_config()
        } else {
            open_config()
        }
    }

    // toggle task mode
    var task_keys = ['t', 'T']
    if (task_keys.indexOf(e.key) != -1){
        console.log('enter task mode')
        if (task_is_showing){
            close_task()
        } else {
            open_task()
        }
    }

    console.log(e.key)
    e.preventDefault();
}

function update_timer(seconds){
    var timer_value = document.getElementById('timer-value')
    timer_value.innerHTML = format_time(seconds)
    document.title = format_time(seconds)
    update_fill()
}

function countdown(){
    if (current_timer === 0){
        timer_complete()
        return
    }
    if (!current_timer){
        current_timer = start_timer_seconds
    }
    current_timer--
    update_timer(current_timer)
//    console.log(current_timer, timer_value)
}

function start_timer(){
    clearInterval(interval)
    interval = setInterval(function(){
        countdown()
    }, 1000);
    document.querySelector('#paused-message').style.display = 'none'
    timer_paused = false
}

function pause_timer(){
    clearInterval(interval)
    document.querySelector('#paused-message').style.display = 'flex'
    timer_paused = true

    // if the timer has completed and user pauses it, assume they want to reset it as well
    if (timer_is_complete == 1){
        reset_timer()
    }
}

function toggle_audio(audio_checkbox){
    if (audio_checkbox.checked == true){
        play_audio_on_complete = true
    } else {
        play_audio_on_complete = false
    }
}

function change_bgcolor(color_input){
    var new_color = color_input.value
    if (new_color){
        if (new_color.length > 0 && new_color.length <= 7 && new_color.substring(0, 1) == '#'){
            document.getElementById('fill').style.background = new_color
        }
    }
}

function restore_config(){
    // read data from localstorage and restore form values
    var config = JSON.parse(localStorage.getItem('config'))
    console.log(config)

    if (document.getElementById('config_ding') && document.getElementById('config_bgcolor')){
        // set the HTML values and then hit each of the methods to read
        document.getElementById('config_ding').checked = config['ding']
        document.getElementById('config_bgcolor').value = config['bgcolor']
        toggle_audio(document.getElementById('config_ding'))
        change_bgcolor(document.getElementById('config_bgcolor'))
    }
}

function save_config(){
    // cycle through form elements and save the values to localstorage
    var config_data = {}
    document.querySelectorAll('.config_el').forEach(function (o){
        if (o.type == 'checkbox'){
            config_data[o.name] = o.checked
        } else {
            config_data[o.name] = o.value
        }
    })

    // store the combined data
    localStorage.setItem('config', JSON.stringify(config_data))
}

function add_task(new_task_name, new_task_estimate){
    var task_template = document.querySelector('.task.template')
    var new_task = task_template.cloneNode(true)
    new_task.classList.remove('template')
    new_task.querySelector('.name').innerHTML = new_task_estimate + ' - ' + new_task_name
    new_task.querySelector('.start').setAttribute('minutes', new_task_estimate)
    document.getElementById('tasks').appendChild(new_task)

    // clear the input
    document.getElementById('add_task_form').new_task.value = ''
    document.getElementById('add_task_form').new_task.focus()
}

function process_add_task_form(f){
    if (f.new_task){
        if (f.new_task.value.trim() == ''){
            return false
        }
        var temp = f.new_task.value.split("-")

        // catch for user entering value without a "-"
        if (temp.length == 1){
            var new_task_name = temp[0].trim()
            var new_task_estimate = 15
        } else {
            var new_task_name = temp[1].trim()
            var new_task_estimate = temp[0].trim()
        }
        console.log(new_task_estimate)
        console.log(new_task_name)
        add_task(new_task_name, new_task_estimate)
    }
}

function start_timer_from_task(task){
    input_minutes = task.getAttribute('minutes')
    set_timer(input_minutes)
    reset_and_restart_timer()
    close_task()
}

function remove_task(task){
    var parent_node = task.parentNode.parentNode.removeChild(task.parentNode)
}

function init(){
    // attach methods to page objects (since we're not allowed to do inline method calls from the HTML file)
    document.querySelector('#close_task_list_button').addEventListener('click', () => {
        close_task()
        return false
    })

    document.querySelectorAll('#task-list .start.button').forEach((el) => {
        el.addEventListener('click', () => {
            start_timer_from_task(this)
        })
    })
    document.querySelectorAll('#task-list .remove.button').forEach((el) => {
        el.addEventListener('click', () => {
            remove_task(this)
        })
    })

    document.querySelector('#add_task_form').addEventListener('submit', () => {
        process_add_task_form(this)
        return false
    })

    document.querySelector('#config_ding').addEventListener('change', () => {
        toggle_audio(this)
    })

    document.querySelector('#config_bgcolor').addEventListener('change', () => {
        change_bgcolor(this)
    })

    document.querySelector('#save_config_button').addEventListener('click', () => {
        close_config()
    })
}

var window_height = window.innerHeight
var window_width = window.innerWidth
var window_x = window.screenLeft
var window_y = window.screenTop
var config_is_showing = 0
var task_is_showing = 0
var play_audio_on_complete = 1


// designed to be initiated after page loads in index.html
window.onload = function() {
    init()
    start_timer()
    document.onkeypress = function(e) {catch_keypress(e)};
    restore_config();
}