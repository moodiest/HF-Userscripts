// ==UserScript==
// @name       HF News Notifier
// @author xadamxk
// @namespace  https://github.com/xadamxk/HF-Scripts
// @version    1.1.1
// @description  Alerts users of new HF News editions (checks on /usercp.php)
// @require https://code.jquery.com/jquery-3.1.1.js
// @match      *://hackforums.net/usercp.php
// @copyright  2016+
// @updateURL https://github.com/xadamxk/HF-Userscripts/raw/master/HF%20News%20Notifier/HF%20News%20Notifier.user.js
// @iconURL https://raw.githubusercontent.com/xadamxk/HF-Userscripts/master/scripticon.jpg
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==
// ------------------------------ Change Log ----------------------------
// version 1.1.0: Using jquery3 now, Added Settings & Changelog block, Added Thread Title Filters, Added Alert Notice Note,
//      Added Multi-Section functionality, Bug Fix: Alert Notice w/out content is fixed, Bug Fix: Alert notice dismissal now works
// version 1.0.1: Added updateURL, Fixed occasional title bug
// version 1.0.0: Initial Release
// ------------------------------ Dev Notes -----------------------------
// TODO: Dismiss alert history
// TODO: Thread history ex.(unread -> read -> new post -> unread)
// ------------------------------ SETTINGS ------------------------------
// Section: Which section to search
var sectionURL = "https://hackforums.net/forumdisplay.php?fid=162";
// Filter Title: Filter unread thread results by keyword 
var titleFilterBool = true; // (true = ON, false = OFF)
var titleFilter = "Edition"; // seperate keywords by commas ex."PP,BTC"
// Debug: Show console.log statements for debugging purposes
var debug = false;
// Alert Note: Note at bottom of alert
var alertNote = "<span id='alertCSS'>(Will fix this bug soon, have a good day.)</span>";
var alertNoteCSS = "<style>#alertCSS{color:red}</style>";
// ------------------------------ ON PAGE LOAD ------------------------------
// Grab most recent news thread title(s)
$.ajax({
    url: sectionURL,
    cache: false,
    success: function(response) {
        // Static Variables
        var newsThreadName;
        var newThreadImage = "newfolder.gif";
        var hotThreadImage = "newhotfolder.gif";
        var html = "<div class='pm_alert' id='news_alert'><div class='float_right'><a href='javascript:$(\"news_alert\").remove();' title='Dismiss this notice'>"+
            "<img src='https://hackforums.net/images/modern_bl/dismiss_notice.gif' style='cursor:pointer' alt='Dismiss this notice'  title='[x]'></a>"+
            "</div><div></div></div>";
        var threadLinkArray = [];
        var threadTitleArray = [];
        var forumTitle;
        var count = 0;
        // Forum Title
        forumTitle = $(response).find(".navigation").find("span").text();
        // Find correct table
        var tableArray = $(response).find(".tborder").toArray();
        var forumTable;
        for(i=0;i < tableArray.length;i++){
            if (debug && !$(tableArray[i]).find("tbody").find("tr").find("td").find("div:eq(1)").find("strong").text().empty())
                console.log("Table Index "+i+": "+$(tableArray[i]).find("tbody").find("tr").find("td").find("div:eq(1)").find("strong").text());
            if($(tableArray[i]).find("tbody").find("tr").find("td").find("div:eq(1)").find("strong").text() === forumTitle){
                // Select correct table
                forumTable = tableArray[i];
            }
        }
        if (debug)
            console.log(forumTable);
        // Break table into rows
        rows = $(forumTable).find( "tbody tr" ).toArray();
        // Column with thread title & link
        // Loop through table rows
        var column2 = 'td:eq(1) div span a:eq(1)';
        for(i = 0; i < rows.length;i++){
            // Debug
            if (debug)
                console.log("IMG SRC: "+$(rows[i]).find('td:eq(0)').find('img').attr('src'));
            // Filter threads by new
            temp = $(rows[i]).find('td:eq(0)').find('img').attr('src');
            if (temp!== undefined && (temp.includes(newThreadImage) || temp.includes(hotThreadImage))){
                threadLinkArray[count] = $(rows[i]).find(column2).attr('href');
                threadTitleArray[count] = $(rows[i]).find(column2).text();
                count++;
            }
        }
        // Alert HTML Heading
        newsThreadName = "<strong class='.thead'><u>New '<a href='"+sectionURL+"'>"+forumTitle+"</a>' Thread(s):</u></strong><br/>";
        // Alert HTML Body
        for (i=0; i < threadLinkArray.length; i++){
            // Title filter
            if (titleFilterBool){
                // For loop for filters
                var titleFilterArray = titleFilter.split(',');
                for(j = 0; j < titleFilterArray.length; j++){
                    if (threadTitleArray[i].includes(titleFilterArray[j]))
                        newsThreadName += "<a href='"+threadLinkArray[i]+"'>"+threadTitleArray[i]+"</a><br/>";
                }
            }
            // No title filter
            else
                newsThreadName += "<a href='"+threadLinkArray[i]+"'>"+threadTitleArray[i]+"</a><br/>";
        }
        // Some fancy string insertion
        substring = "</div><div>";
        position = html.indexOf(substring)+(substring).length;
        newsThreadName += alertNote + alertNoteCSS;
        html = [html.slice(0, position), newsThreadName, html.slice(position)].join('');
        // If new threads => Append HTML
        if (threadLinkArray.length > 0)
            $(html).insertBefore("#content");

        if (debug){
            console.log("rows: "+rows.length);
            console.log("New Threads Found: "+threadLinkArray.length);
            console.log("Alert HTML: "+newsThreadName);
        }
    }
});