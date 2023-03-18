const p = Promise.resolve()
const queue: any[] = []
// 控制执行频率
let isFlushPending = false
export function nextTick(fn) {
    return fn ? p.then(fn) : p
}
export function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job)
    }
    queueFlush()
}
function queueFlush() {
    // 没有isFlushPending每添加一个任务就会开始执行 执行多次
    // 加入这个控制只有第一次进来执行 后面再添加任务的代码是同步的,nextTick中的代码是微任务在执行时job已经添加完成
    if (isFlushPending) return
    isFlushPending = true
    nextTick(flushJobs)
}
function flushJobs() {
    console.log('123')
    isFlushPending = false
    let job
    while ((job = queue.shift())) {
        job && job()
    }
}