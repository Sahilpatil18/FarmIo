
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Tasks({ token }) {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');

    useEffect(() => {
        const fetchTasks = async () => {
            const { data } = await axios.get('http://localhost:3000/tasks', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks(data);
        };
        fetchTasks();
    }, [token]);

    const addTask = async () => {
        await axios.post(
            'http://localhost:3000/tasks',
            { title },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setTitle('');
        const { data } = await axios.get('http://localhost:3000/tasks', {
            headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(data);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="New Task"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <button onClick={addTask}>Add Task</button>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>{task.title}</li>
                ))}
            </ul>
        </div>
    );
}
