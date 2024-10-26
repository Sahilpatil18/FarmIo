
import { useState } from 'react';
import axios from 'axios';

export default function Login({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const loginUser = async () => {
        try {
            const { data } = await axios.post('http://localhost:3000/login', {
                username,
                password,
            });
            setToken(data.token);
            localStorage.setItem('token', data.token);
        } catch (error) {
            alert('Login failed!');
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={loginUser}>Login</button>
        </div>
    );
}
