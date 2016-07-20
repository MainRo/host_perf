
'use strict';

var sys = require('sys')
var exec = require('child_process').exec;


function HealthAgent() {

}


/*
free -m
             total       used       free     shared    buffers     cached
Mem:         15767      15462        305       1689       1882       4934
-/+ buffers/cache:       8644       7122
Swap:         4999        118       4881
*/

var free = {
    // line index
    mem: 1,
    swap: 3,

    // column index
    used: 2,
    free: 3,
    shared: 4,
    buffers: 5,
    cached: 6
}
HealthAgent.prototype.getMemoryUtilization = function (callback) {
    var child = exec("free -m", function (error, stdout, stderr) {
        var result = {
            used : 0,
            free : 0,
            shared : 0,
            buffers : 0,
            cached : 0,
            swap_used : 0,
            swap_free : 0
        }

        if(error == null) {
            var tokens = stdout.split("\n");
            tokens.forEach( function(val, index, array) {
                array[index] = val.replace(/ +/g,"|")
                                    .split("|");
            });

            result.used      = parseInt(tokens[free.mem][free.used]);
            result.free      = parseInt(tokens[free.mem][free.free]);
            result.shared    = parseInt(tokens[free.mem][free.shared]);
            result.buffers   = parseInt(tokens[free.mem][free.buffers]);
            result.cached    = parseInt(tokens[free.mem][free.cached]);
            result.swap_used = parseInt(tokens[free.swap][free.used]);
            result.swap_free = parseInt(tokens[free.swap][free.free]);
        }

        callback(result);
    });
}


/*
    mpstat output looks like this:

    Linux 3.13.0-91-generic (sahnlpt0238) 	08/07/2016 	_x86_64_	(8 CPU)

    14:05:02     CPU    %usr   %nice    %sys %iowait    %irq   %soft  %steal  %guest  %gnice   %idle
    14:05:02     all   18,16    0,04    1,49    0,20    0,00    0,01    0,00    0,00    0,00   80,09
    14:05:02       0    3,98    0,01    0,46    0,26    0,00    0,01    0,00    0,00    0,00   95,29
    14:05:02       1   41,16    0,09    2,84    0,11    0,00    0,01    0,00    0,00    0,00   55,80
    14:05:02       2   47,99    0,08    4,00    0,09    0,00    0,01    0,00    0,00    0,00   47,84
    14:05:02       3   35,74    0,11    3,11    0,38    0,00    0,01    0,00    0,00    0,00   60,66
    14:05:02       4   46,34    0,08    3,77    0,05    0,00    0,01    0,00    0,00    0,00   49,75
    14:05:02       5   39,62    0,08    2,54    0,15    0,00    0,01    0,00    0,00    0,00   57,60
    14:05:02       6   45,67    0,08    3,76    0,03    0,00    0,07    0,00    0,00    0,00   50,40
    14:05:02       7   41,52    0,13    2,81    0,01    0,00    0,01    0,00    0,00    0,00   55,52

*/
var mpstat = {
    // line index
    all_cpu: 3,
    cpu_0: 4,

    // column index
    usr: 2,
    nice: 3,
    sys: 4,
    iowait: 5,
    irq: 6,
    soft: 7,
    steal: 8,
    guest: 9,
    gnice: 10,
    idle: 11
}
HealthAgent.prototype.getCpuUtilisation = function (callback) {
    var child = exec("mpstat -P ALL 1 1", function (error, stdout, stderr) {
        var result = {
            usr : -0.0,
            nice : -0.0,
            sys : -0.0,
            iowait : -0.0,
            irq : -0.0,
            soft : -0.0,
            steal : -0.0,
            guest : -0.0,
            gnice : -0.0,
            all : -0.0
        }

        if(error == null) {
            var tokens = stdout.split("\n");
            tokens.forEach( function(val, index, array) {
                array[index] = val.replace(/,/g,".")
                        .replace(/ +/g,"|")
                        .split("|");
            });
            result.usr = parseFloat(tokens[mpstat.all_cpu][mpstat.usr]);
            result.nice = parseFloat(tokens[mpstat.all_cpu][mpstat.nice]);
            result.sys = parseFloat(tokens[mpstat.all_cpu][mpstat.sys]);
            result.iowait = parseFloat(tokens[mpstat.all_cpu][mpstat.iowait]);
            result.irq = parseFloat(tokens[mpstat.all_cpu][mpstat.irq]);
            result.soft = parseFloat(tokens[mpstat.all_cpu][mpstat.soft]);
            result.steal = parseFloat(tokens[mpstat.all_cpu][mpstat.steal]);
            result.guest = parseFloat(tokens[mpstat.all_cpu][mpstat.guest]);
            result.gnice = parseFloat(tokens[mpstat.all_cpu][mpstat.gnice]);
            result.all = 100.0 - parseFloat(tokens[mpstat.all_cpu][mpstat.idle]);
            result.all = result.all.toFixed(1);
        }
        callback(result);
    });

}

HealthAgent.prototype.getLoad = function (callback) {
    var child = exec("uptime", function (error, stdout, stderr) {
        var result = {
            load1 : -1,
            load5 : -1,
            load15 : -1
        }

        if(error == null) {
            var tokens = stdout.trim()
                        .replace(/, /g," ")
                        .replace(/,/g,".")
                        .split(" ");

            result.load15 = parseFloat(tokens[tokens.length-1]);
            result.load5 = parseFloat(tokens[tokens.length-2]);
            result.load1 = parseFloat(tokens[tokens.length-3]);
        }

        callback(result);
    });
}

HealthAgent.prototype.getMetrics = function (callback) {
    var health = {};
    var self = this;
    this.getLoad( function(load){
        health.load = load;
        self.getCpuUtilisation( function(cpu){
            health.cpu = cpu;
            self.getMemoryUtilization( function(mem){
                health.mem = mem;
                callback(health);
            });
        });
    });
}

module.exports = HealthAgent;
