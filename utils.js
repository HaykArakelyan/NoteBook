const getTime = () => {
    const time = new Date;
    return time.getMonth() + "/" + time.getDate() + "/" + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes();
}

exports.getTime = getTime;