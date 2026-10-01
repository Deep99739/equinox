import { useEffect, useState } from 'react';
import { fetchTodos, addTodo, updateTodo, deleteTodo, type Todo } from '../../api/todosApi';
import './TodosPage.css';
import SignedInNavbar from '../../components/Navbar/SignedInNavbar';
import { getUserEmail, signOut } from '../../utils/authUtils';

export default function TodosPage() {
    const user_email = getUserEmail();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodoText, setNewTodoText] = useState('');
    const [isLoading, setIsLoading] = useState(Boolean(user_email));
    const [error, setError] = useState<string | null>(user_email ? null : 'No user email found');

    const handleSignOut = () => {
        void signOut();
    };

    useEffect(() => {
        if (!user_email) return;
        fetchTodos(user_email)
            .then(data => {
                setTodos(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch todos:', err);
                setError('Failed to load todos');
                setIsLoading(false);
            });
    }, [user_email]);

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodoText.trim()) return;

        try {
            const newTodo = await addTodo({
                user_email,
                text: newTodoText,
            });
            setTodos([newTodo, ...todos]);
            setNewTodoText('');
        } catch (err) {
            console.error('Failed to create todo:', err);
            setError('Failed to create todo');
        }
    };

    const handleToggleComplete = async (todo: Todo) => {
        try {
            const updatedTodo = await updateTodo(todo.id, {
                completed: !todo.completed
            }, user_email || undefined);
            setTodos(todos.map(t => t.id === todo.id ? updatedTodo : t));
        } catch (err) {
            console.error('Failed to update todo:', err);
            setError('Failed to update todo');
        }
    };

    const handleDeleteTodo = async (todoId: string) => {
        if (!confirm('Are you sure you want to delete this todo?')) return;
        try {
            await deleteTodo(todoId, user_email || undefined);
            setTodos(todos.filter(t => t.id !== todoId));
        } catch (err) {
            console.error('Failed to delete todo:', err);
            setError('Failed to delete todo');
        }
    };

    if (isLoading) {
        return (
            <>
                <SignedInNavbar onSignOut={handleSignOut} />
                <div className="todos-app">
                    <div className="loading" style={{ textAlign: 'center', marginTop: '40px' }}>Loading todos...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <SignedInNavbar onSignOut={handleSignOut} />
            <div className="todos-app">
                <div className="todos-container">
                    {error && (
                        <div className="error-banner" onClick={() => setError(null)} style={{ background: '#ff4d4f', color: 'white', padding: '10px', borderRadius: '4px', marginBottom: '20px', cursor: 'pointer' }}>
                            {error} (click to dismiss)
                        </div>
                    )}

                    <div className="todos-header">
                        <h1>Todos</h1>
                    </div>

                    <form className="todo-input-container" onSubmit={handleAddTodo}>
                        <input
                            className="todo-input"
                            value={newTodoText}
                            onChange={e => setNewTodoText(e.target.value)}
                            placeholder="Add a new task..."
                            autoFocus
                        />
                        <button type="submit" className="add-todo-btn" disabled={!newTodoText.trim()}>
                            Add
                        </button>
                    </form>

                    <div className="todos-list">
                        {todos.length === 0 ? (
                            <div className="empty-state">No todos yet. Add one above!</div>
                        ) : (
                            todos.map(todo => (
                                <div key={todo.id} className="todo-item">
                                    <input
                                        type="checkbox"
                                        className="todo-checkbox"
                                        checked={todo.completed}
                                        onChange={() => handleToggleComplete(todo)}
                                    />
                                    <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
                                        {todo.text}
                                    </span>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteTodo(todo.id)}
                                        title="Delete todo"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
