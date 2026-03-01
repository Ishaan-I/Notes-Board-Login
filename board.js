let notes = savedNotes || {}

const COLOURS = [
    "#ffff88",
    "#ffebb1",
    "#ffcccb",
    "#ffccf0",
    "#f0ccff",
    "#bedeff",
    "#bcffbb",
    "#fff"
]

const ghost = document.getElementById("ghost")

let defaultClr = 0

const gridSize = 20
function SnapToGrid(value) {
    return Math.round(value / gridSize) * gridSize
}


function updateDocumentSize() {
    let maxX = window.innerWidth
    let maxY = window.innerHeight

    for (const id in notes) {
        const n = notes[id]
        maxX = Math.max(maxX, n.width + n.x + innerWidth)
        maxY = Math.max(maxY, n.height + n.y + innerHeight)
    }

    document.body.style.minWidth = maxX + "px"
    document.body.style.minHeight = maxY + "px"
}


class Note {
    constructor(id, x, y, colour, width=200, height=200) {
        this.id = id

        this.x = SnapToGrid(x)
        this.y = SnapToGrid(y)

        this.width = SnapToGrid(width);
        this.height = SnapToGrid(height);

        this.colour = colour

        this.title = ""
        this.contents = ""
    }

    create(focus = false) {
        const note = document.createElement("div")
        const paper = document.createElement("div")
        note.appendChild(paper)

        note.className = "note"
        paper.className = "paper"

        const delBtn = document.createElement("button")
        delBtn.textContent = "✖"
        delBtn.className = "delete-btn"

        delBtn.addEventListener("click", e => {
            e.stopPropagation()
            delete notes[this.id]
            note.remove()
            updateDocumentSize()
        })

        note.style.left = this.x + "px"
        note.style.top = this.y + "px"
        note.style.width = this.width + "px"
        note.style.height = this.height + "px"

        note.addEventListener("mouseup", () => {
            const snapW = SnapToGrid(note.offsetWidth)
            const snapH = SnapToGrid(note.offsetHeight)
            note.style.width = snapW + "px"
            note.style.height = snapH + "px"
            notes[this.id].width = snapW
            notes[this.id].height = snapH
            updateDocumentSize()
        })

        paper.style.backgroundColor = COLOURS[this.colour]

        const title = document.createElement("div")
        title.className = "title"

        const maxTitleLength = 34

        title.addEventListener("keypress", e => {
            if (e.key === "Enter") {
                e.preventDefault()
                content.focus()
            }
            if (this.title.length + 1 >= maxTitleLength) {
                e.preventDefault()
            }
        })

        title.contentEditable = true

        const content = document.createElement("div")
        content.className = "content"
        content.contentEditable = true

        title.innerText = this.title
        content.innerText = this.contents

        title.addEventListener("input", () => {
            this.title = title.innerText
            notes[this.id].title = this.title
        })

        content.addEventListener("input", () => {
            this.contents = content.innerText
            if (notes[this.id]) notes[this.id].contents = this.contents
        })

        paper.appendChild(delBtn)
        paper.appendChild(title)
        paper.appendChild(content)

        document.body.appendChild(note)

        setTimeout(() => { if (focus) title.focus() }, 0)
    }
}


document.addEventListener("mousemove", event => {
    ghost.style.left = SnapToGrid(event.pageX) + "px"
    ghost.style.top = SnapToGrid(event.pageY) + "px"

    ghost.style.backgroundColor = COLOURS[defaultClr]

    if (event.target.closest(".note") ||
    event.target.closest("#colour-menu") ||
    event.target.closest("#saveBtn"))
        ghost.style.display = "none"
    else ghost.style.display = "block"
})


const colourMenu = document.getElementById("colour-menu")

for (let i = 0; i < COLOURS.length; i++) {
    const button = document.createElement("button")
    button.className = "clrBtn"
    button.style.backgroundColor = COLOURS[i]

    button.addEventListener("click", () => {
        defaultClr = i;
    });

    colourMenu.appendChild(button)
}


document.getElementById("saveForm").addEventListener("submit", () => {
    document.getElementById("notesData").value = JSON.stringify(notes)
})

document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        document.getElementById("notesData").value = JSON.stringify(notes)
        document.getElementById("saveForm").submit()
    }
})


document.getElementById("clearBtn").addEventListener("click", () => {
    notes = {}
    document.querySelectorAll(".note").forEach(n => n.remove())
    updateDocumentSize()
})


document.addEventListener("mousedown",
    event => {
        if (event.target.closest(".note")) return
        if (event.target.closest("#colour-menu")) return
        if (event.target.closest("#ui-buttons")) return
        
        const id = Number(Date.now())
        const note = new Note(id, event.pageX, event.pageY, defaultClr);

        notes[id] = {
            id,
            x: note.x,
            y: note.y,
            width: note.width,
            height: note.height,
            colour: note.colour,
            title: note.title,
            contents: note.contents
        }

        note.create()
        updateDocumentSize()
    }
)

for (const id in notes) {
    const data = notes[id]
    const note = new Note(data.id, data.x, data.y, data.colour, data.width, data.height)
    note.title = data.title
    note.contents = data.contents
    notes[id] = data
    note.create()
}
updateDocumentSize()