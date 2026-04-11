import express, { Request, Response } from "express";

interface Task {
  id: number;
  title: string;
  done: boolean;
}

const app = express();
app.use(express.json());

const tasks: Task[] = [];
let nextId = 1;

// GET /tasks
app.get("/tasks", (_req: Request, res: Response) => {
  res.json(tasks);
});

// GET /tasks/:id
app.get("/tasks/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(task);
});

// POST /tasks
app.post("/tasks", (req: Request, res: Response) => {
  const { title } = req.body as { title?: unknown };
  if (typeof title !== "string" || title.trim() === "") {
    res.status(400).json({ error: "title is required and must be a string" });
    return;
  }
  const task: Task = { id: nextId++, title: title.trim(), done: false };
  tasks.push(task);
  res.status(201).json(task);
});

// PUT /tasks/:id
app.put("/tasks/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  const body = req.body as { title?: unknown; done?: unknown };
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim() === "") {
      res.status(400).json({ error: "title must be a non-empty string" });
      return;
    }
    task.title = body.title.trim();
  }
  if (body.done !== undefined) {
    if (typeof body.done !== "boolean") {
      res.status(400).json({ error: "done must be a boolean" });
      return;
    }
    task.done = body.done;
  }
  res.json(task);
});

// DELETE /tasks/:id
app.delete("/tasks/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  tasks.splice(index, 1);
  res.status(204).send();
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Task Manager API running on http://localhost:${PORT}`);
});
