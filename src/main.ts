const properties = PropertiesService.getScriptProperties();

const ACCESS_TOKEN = properties.getProperty("ACCESS_TOKEN");
const PUSH_URL = "https://api.line.me/v2/bot/message/push";

function doPost(e: any) {
    const type = JSON.parse(e.postData.contents).events[0].type;
    if (type === "join") {
        setGroupId(e);
        const greetings =
            "グループ分けbotです。\n\n毎週月曜日午前8:30にディスカッションのグループ分けを自動で行います。";
        push(greetings);
    } else {
        return;
    }
}

function setGroupId(e: any) {
    const groupId = JSON.parse(e.postData.contents).events[0].source.groupId;
    properties.setProperty("groupId", groupId);
}

function shuffle(memberList: string[]) {
    for (let i = memberList.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [memberList[i], memberList[j]] = [memberList[j], memberList[i]];
    }
    return memberList;
}

function makeGroupText(
    groupNum: number,
    femaleShuflled: string[],
    maleShuffled: string[]
) {
    const group =
        groupNum.toString() +
        "： " +
        femaleShuflled.join(" ") +
        " " +
        maleShuffled.join(" ");

    return group;
}

function grouping() {
    const maleShuffled = shuffle(male);
    const femaleShuflled = shuffle(female);

    const group1 = makeGroupText(
        1,
        femaleShuflled.slice(0, 2),
        maleShuffled.slice(0, 3)
    );
    const group2 = makeGroupText(
        2,
        femaleShuflled.slice(2, 4),
        maleShuffled.slice(3, 6)
    );
    const group3 = makeGroupText(
        3,
        femaleShuflled.slice(4, 6),
        maleShuffled.slice(6, 10)
    );

    const groupList = [group1, group2, group3];

    push("", groupList);
}

function push(pushText: string, groupList?: string[]) {
    if (groupList === undefined) {
        // POSTオプション作成
        const options: any = {
            method: "POST",
            headers: header(),
            payload: JSON.stringify(postData(pushText)),
        };

        return UrlFetchApp.fetch(PUSH_URL, options);
    } else {
        // POSTオプション作成
        const options: any = {
            method: "POST",
            headers: header(),
            payload: JSON.stringify(postData(pushText, groupList)),
        };

        return UrlFetchApp.fetch(PUSH_URL, options);
    }
}

function header() {
    return {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: "Bearer " + ACCESS_TOKEN,
    };
}

function postData(pushText: string, groupList?: string[]) {
    if (groupList === undefined) {
        return {
            to: properties.getProperty("groupId"),
            messages: [
                {
                    type: "text",
                    text: pushText,
                },
            ],
        };
    } else {
        return {
            to: properties.getProperty("groupId"),
            messages: [
                {
                    type: "flex",
                    altText: "本日のディスカッショングループ",
                    contents: makeFlexMessage(groupList),
                },
            ],
        };
    }
}

function makeDayStr() {
    const date = new Date();
    const day =
        (date.getMonth() + 1).toString() + "/" + date.getDate().toString();

    return day;
}

function makeFlexMessage(groupList: string[]) {
    const flexMessage = {
        type: "bubble",
        header: {
            type: "box",
            layout: "vertical",
            spacing: "none",
            contents: [
                {
                    type: "text",
                    text: makeDayStr() + "のグループ",
                    wrap: true,
                },
                {
                    type: "separator",
                },
            ],
        },

        body: {
            type: "box",
            layout: "vertical",
            spacing: "lg",
            contents: [
                {
                    type: "text",
                    text: groupList[0],
                    wrap: true,
                },
                {
                    type: "separator",
                },
                {
                    type: "text",
                    text: groupList[1],
                    wrap: true,
                },
                {
                    type: "separator",
                },
                {
                    type: "text",
                    text: groupList[2],
                    wrap: true,
                },
            ],
        },
    };

    return flexMessage;
}

function setSetGroupingTrigger() {
    ScriptApp.newTrigger("setGroupingTrigger")
        .timeBased()
        .onWeekDay(ScriptApp.WeekDay.MONDAY)
        .atHour(7)
        .create();
}

function setGroupingTrigger() {
    const triggerDay = new Date();
    triggerDay.setHours(8);
    triggerDay.setMinutes(30);

    ScriptApp.newTrigger("grouping").timeBased().at(triggerDay).create();
}
