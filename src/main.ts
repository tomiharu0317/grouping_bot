// import { male, female } from "./members";

const properties = PropertiesService.getScriptProperties();

const ACCESS_TOKEN = properties.getProperty("ACCESS_TOKEN");
const PUSH_URL = "https://api.line.me/v2/bot/message/push";

const male = [
    "石井",
    "鈴木",
    "田口",
    "富木",
    "富澤",
    "野口",
    "牧野",
    "三澤",
    "山岸",
];
const female = ["伊藤", "倉橋", "椚田", "佐々木", "陳", "平井"];

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

function makeGroupText(femaleShuflled: string[], maleShuffled: string[]) {
    const group = femaleShuflled.join(" ") + " " + maleShuffled.join(" ");

    return group;
}

function makePushText(group1: string, group2: string, group3: string) {
    const pushText =
        "グループ1：" +
        group1 +
        "\n" +
        "グループ２：" +
        group2 +
        "\n" +
        "グループ3：" +
        group3;

    return pushText;
}

function grouping() {
    const maleShuffled = shuffle(male);
    const femaleShuflled = shuffle(female);

    const group1 = makeGroupText(
        femaleShuflled.slice(0, 2),
        maleShuffled.slice(0, 3)
    );
    const group2 = makeGroupText(
        femaleShuflled.slice(2, 4),
        maleShuffled.slice(3, 6)
    );
    const group3 = makeGroupText(
        femaleShuflled.slice(4, 6),
        maleShuffled.slice(6, 10)
    );

    const pushText = makePushText(group1, group2, group3);

    push(pushText);
}

function push(pushText: string) {
    // POSTオプション作成
    const options: any = {
        method: "POST",
        headers: header(),
        payload: JSON.stringify(postData(pushText)),
    };

    return UrlFetchApp.fetch(PUSH_URL, options);
}

function header() {
    return {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: "Bearer " + ACCESS_TOKEN,
    };
}

function postData(pushText: string) {
    return {
        to: properties.getProperty("groupId"),
        messages: [
            {
                type: "text",
                text: pushText,
            },
        ],
    };
}
