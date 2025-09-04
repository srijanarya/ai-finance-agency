#!/bin/bash
echo '🚀 LAUNCHING TREUM ALGOTECH AUTO-POSTER'
echo 'Posts scheduled for: 8:30 AM and 4:00 PM IST'
echo ''
nohup python3 tomorrow_scheduler.py > posting_log.txt 2>&1 &
echo '✅ Auto-poster is running in background!'
echo '📝 Check posting_log.txt for status'
echo 'PID:' $!
echo ''
echo 'To stop: pkill -f tomorrow_scheduler.py'
echo 'To check: tail -f posting_log.txt'
