@echo off
call webpack tdapp_all.js tdapp.bundled.js
call uglifyjs tdapp.bundled.js -o tdapp.bundled.min.js