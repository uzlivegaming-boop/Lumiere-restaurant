import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
    adminLogin,
    adminLogout,
    getAdminOrders,
    getAdminStatus,
    updateOrderStatus,
} from '../api/admin';

export default function Admin() {
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const knownOrderIds = useRef(null);

    const {
        data: orders = [],
        isLoading: ordersLoading,
        isFetching: ordersFetching,
        isError: ordersIsError,
        refetch: loadOrders,
    } = useQuery({
        queryKey: ['adminOrders'],
        queryFn: async () => {
            const result = await getAdminOrders();
            return result.data || [];
        },
        enabled: isAdmin,
        refetchInterval: isAdmin ? 15000 : false,
        retry: false,
    });

    // Admin tizimga kirganini tekshirish
    useEffect(() => {
        let active = true;

        async function checkAdmin() {
            try {
                const result = await getAdminStatus();

                if (active && result.isAdmin) {
                    setIsAdmin(true);
                }
            } catch {
                if (active) {
                    setError('Server bilan bog‘lanib bo‘lmadi.');
                }
            }
        }

        checkAdmin();

        return () => {
            active = false;
        };
    }, []);

    // Yangi buyurtmalar uchun ovozli bildirishnoma
    useEffect(() => {
        if (!isAdmin || ordersLoading || ordersIsError) return;

        const currentIds = orders.map((order) => order.id);

        if (knownOrderIds.current === null) {
            knownOrderIds.current = currentIds;
            return;
        }

        const hasNewOrder = currentIds.some(
            (id) => !knownOrderIds.current.includes(id)
        );

        knownOrderIds.current = currentIds;

        if (hasNewOrder) {
            const audio = new Audio('/notification.mp3');

            audio.play().catch(() => {
                console.log('Bildirishnoma ovozini ijro etib bo‘lmadi.');
            });
        }
    }, [orders, isAdmin, ordersLoading, ordersIsError]);

    async function handleLogin(event) {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            await adminLogin(password);
            setPassword('');
            knownOrderIds.current = null;
            setIsAdmin(true);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Kirishda xatolik yuz berdi.'
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        setError('');

        try {
            await adminLogout();
            setIsAdmin(false);
            knownOrderIds.current = null;
            setStatusFilter('ALL');
        } catch {
            setError('Tizimdan chiqishda xatolik yuz berdi.');
        }
    }

    async function refreshOrders() {
        setError('');

        try {
            const result = await loadOrders();

            if (result.isError) {
                setError('Buyurtmalarni yangilab bo‘lmadi.');
            }
        } catch {
            setError('Buyurtmalarni yangilab bo‘lmadi.');
        }
    }

    async function handleStatusChange(orderId, status) {
        setError('');
        setUpdatingOrderId(orderId);

        try {
            await updateOrderStatus(orderId, status);
            await loadOrders();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Buyurtma holatini o‘zgartirib bo‘lmadi.'
            );
        } finally {
            setUpdatingOrderId(null);
        }
    }

    const filteredOrders = orders.filter((order) => {
        const matchesStatus =
            statusFilter === 'ALL' || order.status === statusFilter;

        const search = searchTerm.trim().toLowerCase();

        const matchesSearch =
            String(order.id).toLowerCase().includes(search) ||
            (order.customerName || '').toLowerCase().includes(search) ||
            (order.phone || '').toLowerCase().includes(search);

        return matchesStatus && matchesSearch;
    });

    const orderStats = [
        {
            title: 'Jami buyurtmalar',
            count: orders.length,
            icon: '📋',
        },
        {
            title: 'Kutilmoqda',
            count: orders.filter((order) => order.status === 'PENDING').length,
            icon: '⏳',
        },
        {
            title: 'Tayyorlanmoqda',
            count: orders.filter((order) => order.status === 'PREPARING').length,
            icon: '👨‍🍳',
        },
        {
            title: 'Yakunlangan',
            count: orders.filter((order) => order.status === 'COMPLETED').length,
            icon: '✅',
        },
    ];

    if (!isAdmin) {
        return (
            <main className="admin-page">
                <form className="admin-login" onSubmit={handleLogin}>
                    <p className="admin-eyebrow">LUMIERE RESTAURANT</p>
                    <h1>Admin panel</h1>
                    <p>Davom etish uchun admin parolini kiriting.</p>

                    <label htmlFor="admin-password">Admin paroli</label>

                    <input
                        id="admin-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Parolni kiriting"
                        autoComplete="current-password"
                        required
                    />

                    {error && (
                        <p className="admin-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Tekshirilmoqda...' : 'Kirish'}
                    </button>
                </form>
            </main>
        );
    }

    return (
        <main className="admin-page">
            <section className="admin-dashboard">
                <header className="admin-header">
                    <div>
                        <p className="admin-eyebrow">LUMIERE RESTAURANT</p>
                        <h1>Buyurtmalar</h1>
                        <p>Jami buyurtmalar: {orders.length}</p>
                        <p>Ko‘rsatilmoqda: {filteredOrders.length}</p>

                        <div className="admin-filter">
                            <label htmlFor="status-filter">
                                Holati bo‘yicha:
                            </label>

                            <input
                                className="admin-search"
                                type="search"
                                placeholder="Ism, telefon yoki buyurtma ID..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                            />

                            <select
                                id="status-filter"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                            >
                                <option value="ALL">Barcha buyurtmalar</option>
                                <option value="PENDING">Kutilmoqda</option>
                                <option value="CONFIRMED">Tasdiqlandi</option>
                                <option value="PREPARING">Tayyorlanmoqda</option>
                                <option value="READY">Tayyor</option>
                                <option value="COMPLETED">Yakunlandi</option>
                                <option value="CANCELLED">Bekor qilindi</option>
                            </select>
                        </div>
                    </div>

                    <div className="admin-actions">
                        <button
                            type="button"
                            onClick={refreshOrders}
                            disabled={ordersFetching}
                        >
                            {ordersFetching ? 'Yangilanmoqda...' : 'Yangilash'}
                        </button>

                        <button type="button" onClick={handleLogout}>
                            Chiqish
                        </button>
                    </div>
                </header>

                <div className="admin-stats">
                    {orderStats.map((stat) => (
                        <article className="admin-stat-card" key={stat.title}>
                            <span className="admin-stat-icon">{stat.icon}</span>
                            <p>{stat.title}</p>
                            <h2>{stat.count}</h2>
                        </article>
                    ))}
                </div>

                {error && (
                    <p className="admin-error" role="alert">
                        {error}
                    </p>
                )}

                {ordersIsError && (
                    <p className="admin-error" role="alert">
                        Buyurtmalarni olishda xatolik. Serverni tekshiring.
                    </p>
                )}

                {ordersLoading ? (
                    <p>Buyurtmalar yuklanmoqda...</p>
                ) : filteredOrders.length === 0 ? (
                    <p>
                        {orders.length === 0
                            ? 'Hozircha buyurtmalar yo‘q.'
                            : 'Tanlangan holatda buyurtmalar topilmadi.'}
                    </p>
                ) : (
                    <div className="admin-orders">
                        {filteredOrders.map((order) => (
                            <article className="admin-order" key={order.id}>
                                <h2>Buyurtma #{order.id}</h2>

                                <p className="admin-order-date">
                                    <span>Buyurtma vaqti:</span>{' '}
                                    {new Date(order.createdAt).toLocaleString(
                                        'uz-UZ',
                                        {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        }
                                    )}
                                </p>

                                <p>Mijoz: {order.customerName}</p>
                                <p>Telefon: {order.phone}</p>
                                <p>Manzil: {order.address}</p>

                                <label htmlFor={`status-${order.id}`}>
                                    Buyurtma holati
                                </label>

                                <select
                                    id={`status-${order.id}`}
                                    value={order.status}
                                    disabled={updatingOrderId === order.id}
                                    onChange={(event) =>
                                        handleStatusChange(
                                            order.id,
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="PENDING">Kutilmoqda</option>
                                    <option value="CONFIRMED">Tasdiqlandi</option>
                                    <option value="PREPARING">Tayyorlanmoqda</option>
                                    <option value="READY">Tayyor</option>
                                    <option value="COMPLETED">Yakunlandi</option>
                                    <option value="CANCELLED">Bekor qilindi</option>
                                </select>

                                {updatingOrderId === order.id && (
                                    <p>Holat yangilanmoqda...</p>
                                )}

                                {order.note && <p>Izoh: {order.note}</p>}

                                <p>
                                    Jami:{' '}
                                    {Number(order.total).toLocaleString('uz-UZ')}{' '}
                                    so‘m
                                </p>

                                <h3>Taomlar</h3>

                                {order.items?.map((item) => (
                                    <p key={item.id}>
                                        {item.dish?.name || 'Taom'} ×{' '}
                                        {item.quantity}
                                    </p>
                                ))}
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}