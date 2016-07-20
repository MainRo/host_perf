host perf is a simple linux performance monitoring tool. I use it with a
dedicated mzbench worker to monitor the tested systems load:
https://machinezone.github.io/mzbench/
https://github.com/MainRo/perf_mzbench

It exposes the  linux performance checklist of Brendan Gregg via an
http web service:
http://www.brendangregg.com/blog/2016-05-04/srecon2016-perf-checklists-for-sres.html

the metrics are returned as a json object, served on the following url:

    host:4242/status
