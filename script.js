//setup the canvas
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

/**make the canvas always fill the screen**/;
(function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    window.onresize = resize
})()

//for this code (as in code before this line), I almost always use the same stuff, so its going to stay here

//set the grid size
const targetCellSize = 100
const gx = Math.round(canvas.width / targetCellSize)
const bx = canvas.width / gx
const gy = Math.round(canvas.height / targetCellSize)
const by = canvas.height / gy

//fill the grid
let grid = []
for (let iy = 0; iy < gy; iy++) {
    grid[iy] = []
    let row = grid[iy]
    for (let ix = 0; ix < gx; ix++) {
        const cell = {}
        cell.x = ix
        cell.y = iy
        iy > 0 ? cell.up = true : null
        ix < gx - 1 ? cell.right = true : null
        iy < gy - 1 ? cell.down = true : null
        ix > 0 ? cell.left = true : null
        row[ix] = cell
    }
}

//will break the wall for both cells
function breakWall(x, y, side) {
    grid[y][x][side] = false
    if (side == 'up') {
        side = 'down'
        y--
    }
    else if (side == 'right') {
        side = 'left'
        x++
    }
    else if (side == 'down') {
        side = 'up'
        y++
    }
    else if (side == 'left') {
        side = 'right'
        x--
    }
    else throw 'not a valid side'
    grid[y][x][side] = false

}
//checks for included cell
function includesCell(stack, cell) {
    for (const item of stack)
        if (item.x == cell.x && item.y == cell.y)
            return true
    return false
}

//returns a list of all the cells in the area
//but will break if there is a loop
function findConnectedCells(x, y, stack = []) {
    const cell = grid[y][x]
    if (!includesCell(stack, cell)) {
        stack.push(cell)
        if (cell.up == false) stack = findConnectedCells(x, y - 1, stack)
        if (cell.right == false) stack = findConnectedCells(x + 1, y, stack)
        if (cell.down == false) stack = findConnectedCells(x, y + 1, stack)
        if (cell.left == false) stack = findConnectedCells(x - 1, y, stack)
    }
    return stack
}

//trys to break walls, recursively
function grow(x = 0, y = 0, home) {
    home = home ?? grid[y][x]

    const offset = Math.floor(Math.random() * 4)
    for (let index = 0; index < 4; index++) {

        if ((index + offset) % 4 == 0 && y > 0)
            if (!includesCell(findConnectedCells(x, y - 1), home)) {
                breakWall(x, y, 'up')
                grow(x, y - 1, home)
            }
        if ((index + offset) % 4 == 1 && x < gx - 1)
            if (!includesCell(findConnectedCells(x + 1, y), home)) {
                breakWall(x, y, 'right')
                grow(x + 1, y, home)
            }
        if ((index + offset) % 4 == 2 && y < gy - 1)
            if (!includesCell(findConnectedCells(x, y + 1), home)) {
                breakWall(x, y, 'down')
                grow(x, y + 1, home)
            }
        if ((index + offset) % 4 == 3 && x > 0)
            if (!includesCell(findConnectedCells(x - 1, y), home)) {
                breakWall(x, y, 'left')
                grow(x - 1, y, home)
            }
    }
}

grow()

    //the render loop
    ;
(function render() {
    //clear the screen
    ctx.fillStyle = 'rgb(0,0,0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    //render the cells
    ctx.strokeStyle = 'rgb(0,255,0)'
    for (let iy = 0; iy < gy; iy++) {
        let row = grid[iy]
        for (let ix = 0; ix < gx; ix++) {
            ctx.beginPath()
            ctx.moveTo(ix * bx, iy * by)
            const cell = row[ix]
            if (cell.up) ctx.lineTo(ix * bx + bx, iy * by)
            else ctx.moveTo(ix * bx + bx, iy * by)
            if (cell.right) ctx.lineTo(ix * bx + bx, iy * by + by)
            else ctx.moveTo(ix * bx + bx, iy * by + by)
            if (cell.down) ctx.lineTo(ix * bx, iy * by + by)
            else ctx.moveTo(ix * bx, iy * by + by)
            if (cell.left) ctx.lineTo(ix * bx, iy * by)
            else ctx.moveTo(ix * bx, iy * by)
            ctx.stroke()
        }
    }

    requestAnimationFrame(render)
})()