let notes = savedNotes || {}

const defWidth = 200;
const defHeight = 200;

let selected = ""

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
let ctrlHeld = false

const gridSize = 20
function SnapToGrid(value) {
    return Math.round(value / gridSize) * gridSize
}


function updateDocumentSize() {
    let maxX = window.innerWidth
    let maxY = window.innerHeight

    for (const id in notes) {
        const n = notes[id]
        maxX = Math.max(maxX, (n.width * gridSize) + n.x + innerWidth)
        maxY = Math.max(maxY, (n.height) + n.y + innerHeight)
    }

    document.body.style.minWidth = maxX + "px"
    document.body.style.minHeight = maxY + "px"
}


document.addEventListener("keydown", e => {
    if (e.key == "Control" && !ctrlHeld) {
        ctrlHeld = true

        document.querySelectorAll(".note").forEach(note => {
            note.classList.add("link-mode")
            const btn = note.querySelector(".note-btn")
            btn.textContent = "→"
            btn.classList.add("link-mode")
        })

        document.body.classList.add("link-mode")
    }
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        document.getElementById("notesData").value = JSON.stringify(notes)
        document.getElementById("saveForm").submit()
    }
})


document.addEventListener("keyup", e => {
    if (e.key === "Control") exitLinkMode()
})


function exitLinkMode() {
    selected = ""
    ctrlHeld = false
    document.body.classList.remove("link-mode")
    document.querySelectorAll(".note").forEach(n => {
        n.classList.remove("link-mode", "selected")
        n.querySelector(".note-btn").textContent = "✖"
        n.querySelector(".note-btn").classList.remove("link-mode")
    })
}

class Note {
    constructor(id, x, y, colour, link = null, width = defWidth, height = defHeight) {
        this.id = id

        this.x = SnapToGrid(x)
        this.y = SnapToGrid(y)

        this.width = SnapToGrid(width);
        this.height = SnapToGrid(height);

        this.colour = colour

        this.link = link

        this.title = ""
        this.contents = ""
    }

    create(focus = false) {
        const note = document.createElement("div")
        const paper = document.createElement("div")

        note.className = "note"
        note.id = this.id

        paper.className = "paper"
        paper.style.backgroundColor = COLOURS[this.colour]

        const noteBtn = document.createElement("button")
        noteBtn.textContent = "✖"
        noteBtn.className = "note-btn"
        if (ctrlHeld) noteBtn.classList.add("link-mode")
        
        noteBtn.addEventListener("mouseenter", () => {
            if (!ctrlHeld) return

            const destId = notes[this.id]?.link
            if (!destId || !notes[destId]) return

            const dest = notes[destId]

            const preview = document.createElement("div")
            preview.className = "link-preview"
            preview.textContent = dest.title || "[untitled]"
            preview.style.backgroundColor = COLOURS[dest.colour]

            document.body.appendChild(preview)

            noteBtn.addEventListener("mousemove", e => {
                preview.style.left = (e.pageX + 12) + "px"
                preview.style.top = (e.pageY + 12) + "px"
            }, { once: false })

            noteBtn._preview = preview
        })

        noteBtn.addEventListener("mouseleave", () => {
            if (noteBtn._preview) {
                noteBtn._preview.remove()
                noteBtn._preview = null
            }
        })

        note.addEventListener("click", e => {
            if (e.target.closest(".note-btn")) {
                e.stopPropagation()
                if (ctrlHeld) {
                    const goTo = document.getElementById(notes[this.id].link)
                    if (goTo) goTo.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
                } else {
                    delete notes[this.id]
                    note.remove()
                    updateDocumentSize()
                }
                return
            }

            if (!ctrlHeld) return

            if (selected === "") {
                selected = this.id
                note.classList.add("selected")
            } else if (selected === this.id) {
                selected = ""
                note.classList.remove("selected")
            } else {
                notes[selected].link = this.id
                document.getElementById(selected).classList.remove("selected")
                
                exitLinkMode()
            }
        })

        note.style.left = this.x + "px"
        note.style.top = this.y + "px"
        note.style.width = this.width + "px"
        note.style.height = this.height + "px"

        let maxWidth = this.width / 10
        note.addEventListener("mouseup", () => {
            const snapW = SnapToGrid(note.offsetWidth)
            const snapH = SnapToGrid(note.offsetHeight)
            note.style.width = snapW + "px"
            note.style.height = snapH + "px"
            notes[this.id].width = snapW
            notes[this.id].height = snapH
            maxWidth = snapW / 10
            updateDocumentSize()
        })

        const title = document.createElement("div")
        title.className = "title"
        title.innerText = this.title
        title.contentEditable = true

        title.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault()
                content.focus()
            }
            if (title.innerText.length <= 1 && (e.key === "Backspace" || e.key === "Delete")) {
                delete notes[this.id]
                note.remove()
                updateDocumentSize()
            }
            else if (title.innerText.length + 1 >= maxWidth) {
                e.preventDefault()
            }
        })
        title.addEventListener("input", () => {
            this.title = title.innerText
            notes[this.id].title = this.title
        })


        const content = document.createElement("div")
        content.className = "content"
        content.contentEditable = true
        content.innerText = this.contents
        content.addEventListener("input", () => {
            this.contents = content.innerText
            if (notes[this.id]) notes[this.id].contents = this.contents
        })

        note.appendChild(paper)
        paper.appendChild(noteBtn)
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
        event.target.closest("#ui-buttons") ||
        event.target.closest(".link-mode"))
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
        if (event.target.closest(".link-mode")) return
        
        const id = Number(Date.now())
        const note = new Note(id, event.pageX, event.pageY, defaultClr);

        notes[id] = {
            id,
            x: note.x,
            y: note.y,
            width: note.width,
            height: note.height,
            colour: note.colour,
            link: note.link,
            title: note.title,
            contents: note.contents
        }

        note.create(true)
        updateDocumentSize()
    }
)

for (const id in notes) {
    const data = notes[id]
    const note = new Note(data.id, data.x, data.y, data.colour, data.link, data.width, data.height)
    note.title = data.title
    note.contents = data.contents
    notes[id] = data
    note.create()
}
updateDocumentSize()
