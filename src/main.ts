const properties = PropertiesService.getScriptProperties();

const ACCESS_TOKEN = properties.getProperty("ACCESS_TOKEN");
const PUSH_URL = "https://api.line.me/v2/bot/message/push";

function doPost(e: any) {
    const type = JSON.parse(e.postData.contents).events[0].type;

    // グループ参加イベントで挨拶メッセージ;
    if (type === "join") {
        setGroupId(e);
        // const greetings =
        //     "グループ分けbotです。\n\n毎週月曜日午前7時-8時にディスカッションのグループ分けを自動で行います。";
        // push(greetings);
    } else {
        return;
    }
}

// 招待された時にグループIDを設定
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
    const rep = assignRepresentative();
    const members = femaleShuflled.concat(maleShuffled);

    const repFemale: number = rep[0];
    const repMale: number = rep[1];

    const group = {
        type: "box",
        layout: "horizontal",
        contents: [
            {
                type: "text",
                text: groupNum.toString(),
                align: "center",
                wrap: true,
            },
        ],
    };

    for (let i = 0; i < 5; i++) {
        const memberObj = {
            type: "text",
            text: members[i],
            align: "start",
            size: "xxs",
            color: "#000000",
            margin: "10px",
            wrap: true,
        };

        if (i === repFemale || i === repMale) {
            memberObj["color"] = "#1E90FF";
        }

        group.contents.push(memberObj);
    }

    return group;
}

function assignRepresentative() {
    const repMale = Math.floor(Math.random() * (4 - 2 + 1)) + 2;
    const repFemale = Math.floor(Math.random() * (1 - 0 + 1)) + 0;

    const rep = [repFemale, repMale];

    return rep;
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

    push(groupList);
}

function push(groupList: any[]) {
    // POSTオプション作成
    const options: any = {
        method: "POST",
        headers: header(),
        payload: JSON.stringify(postData(groupList)),
    };

    return UrlFetchApp.fetch(PUSH_URL, options);
}

function header() {
    return {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: "Bearer " + ACCESS_TOKEN,
    };
}

// 挨拶メッセージとflex messageで分岐
function postData(groupList: any[]) {
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

function makeDayStr() {
    const date = new Date();
    const day =
        (date.getMonth() + 1).toString() + "/" + date.getDate().toString();

    return day;
}

function makeFlexMessage(groupList: any[]) {
    const flexMessage = {
        type: "bubble",
        header: {
            type: "box",
            layout: "vertical",
            spacing: "md",
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
                groupList[0],
                {
                    type: "separator",
                },
                groupList[1],
                {
                    type: "separator",
                },
                groupList[2],
            ],
        },
    };

    return flexMessage;
}

// 毎週月曜日午前7時から8時に「8:30にグルーピングする関数のトリガー」を設定
// function setSetGroupingTrigger() {
//     ScriptApp.newTrigger("setGroupingTrigger")
//         .timeBased()
//         .onWeekDay(ScriptApp.WeekDay.MONDAY)
//         .atHour(7)
//         .create();
// }

function setGroupingTrigger() {
    ScriptApp.newTrigger("grouping")
        .timeBased()
        .onWeekDay(ScriptApp.WeekDay.MONDAY)
        .atHour(7)
        .create();
}

// // 8:30にグルーピング
// function setGroupingTrigger() {
//     const triggerDay = new Date();
//     triggerDay.setHours(8);
//     triggerDay.setMinutes(30);

//     ScriptApp.newTrigger("grouping").timeBased().at(triggerDay).create();
// }
