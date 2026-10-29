
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
    getDishes,
    createDish,
    updateDish,
    deleteDish,
} from '../api/dishes';

import { getCategories } from '../api/categories';

import {
    adminLogin,
    adminLogout,
    getAdminOrders,
    getAdminStatus,
    updateOrderStatus,
    getAdminBookings,
    updateBookingStatus,
} from '../api/admin';

function makeSlug(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/['ʻ’`]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const emptyDishForm = {
    name: '',
    slug: '',
    description: '',
    ingredients: '',
    steps: '',
    price: '',
    image: '',
    categoryId: '',
    isAvailable: true,
};

function toList(value) {
    if (Array.isArray(value)) return value;

    return String(value || '')
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
}

export default function Admin() {
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('orders');

    const [statusFilter, setStatusFilter] = useState('ALL');
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const knownOrderIds = useRef(null);

    const [updatingBookingId, setUpdatingBookingId] = useState(null);

    // Taomlar CRUD uchun state'lar
    const [dishes, setDishes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [dishesLoading, setDishesLoading] = useState(false);
    const [dishError, setDishError] = useState('');
    const [savingDish, setSavingDish] = useState(false);
    const [deletingDishId, setDeletingDishId] = useState(null);
    const [editingDishId, setEditingDishId] = useState(null);
    const [dishSearch, setDishSearch] = useState('');
    const [dishForm, setDishForm] = useState(emptyDishForm);

    const {
        data: bookings = [],
        isLoading: bookingsLoading,
        refetch: loadBookings,
    } = useQuery({
        queryKey: ['adminBookings'],
        queryFn: async () => {
            const result = await getAdminBookings();
            return result.data || [];
        },
        enabled: isAdmin,
        refetchInterval: isAdmin ? 15000 : false,
        retry: false,
    });

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

    // Admin kirganda taomlar va kategoriyalarni yuklash
    useEffect(() => {
        if (!isAdmin) return;

        let active = true;

        async function loadDishData() {
            setDishesLoading(true);
            setDishError('');

            try {
                const [dishResult, categoryResult] = await Promise.all([
                    getDishes(),
                    getCategories(),
                ]);

                if (active) {
                    setDishes(dishResult);
                    setCategories(categoryResult);
                }
            } catch (err) {
                if (active) {
                    setDishError(
                        err.response?.data?.message ||
                        'Taomlar yoki kategoriyalarni yuklab bo‘lmadi.'
                    );
                }
            } finally {
                if (active) setDishesLoading(false);
            }
        }

        loadDishData();

        return () => {
            active = false;
        };
    }, [isAdmin]);

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
            setActiveTab('orders');
            setDishForm(emptyDishForm);
            setEditingDishId(null);
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

    async function handleBookingStatusChange(bookingId, status) {
        setError('');
        setUpdatingBookingId(bookingId);

        try {
            await updateBookingStatus(bookingId, status);
            await loadBookings();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Band qilish holatini o‘zgartirib bo‘lmadi.'
            );
        } finally {
            setUpdatingBookingId(null);
        }
    }

    // Taomlar ro‘yxatini qayta yuklash
    async function refreshDishes() {
        setDishesLoading(true);
        setDishError('');

        try {
            const [dishResult, categoryResult] = await Promise.all([
                getDishes(),
                getCategories(),
            ]);

            setDishes(dishResult);
            setCategories(categoryResult);
        } catch (err) {
            setDishError(
                err.response?.data?.message ||
                'Taomlarni yangilab bo‘lmadi.'
            );
        } finally {
            setDishesLoading(false);
        }
    }

    // Forma maydonlarini boshqarish
    function handleDishFieldChange(event) {
        const { name, value, type, checked } = event.target;

        setDishForm((previous) => {
            const next = {
                ...previous,
                [name]: type === 'checkbox' ? checked : value,
            };

            if (name === 'name' && !editingDishId) {
                next.slug = makeSlug(value);
            }

            return next;
        });
    }

    // Yangi taom qo‘shish yoki mavjudini tahrirlash
    async function handleDishSubmit(event) {
        event.preventDefault();
        setDishError('');

        if (!dishForm.categoryId) {
            setDishError('Avval taom kategoriyasini tanlang.');
            return;
        }

        const payload = {
            name: dishForm.name.trim(),
            slug: dishForm.slug.trim() || makeSlug(dishForm.name),
            description: dishForm.description.trim(),
            ingredients: toList(dishForm.ingredients),
            steps: toList(dishForm.steps),
            price: Number(dishForm.price),
            image: dishForm.image.trim(),
            categoryId: dishForm.categoryId,
            isAvailable: dishForm.isAvailable,
        };

        if (
            !payload.name ||
            !payload.slug ||
            !payload.description ||
            !payload.image ||
            !Number.isFinite(payload.price) ||
            payload.price <= 0 ||
            payload.ingredients.length === 0 ||
            payload.steps.length === 0
        ) {
            setDishError(
                'Barcha maydonlarni to‘ldiring. Narx musbat bo‘lishi kerak.'
            );
            return;
        }

        setSavingDish(true);

        try {
            if (editingDishId) {
                await updateDish(editingDishId, payload);
            } else {
                await createDish(payload);
            }

            setDishForm(emptyDishForm);
            setEditingDishId(null);

            await refreshDishes();
        } catch (err) {
            setDishError(
                err.response?.data?.message ||
                'Taomni saqlashda xatolik yuz berdi.'
            );
        } finally {
            setSavingDish(false);
        }
    }

    // Taomni forma ichiga yuklash
    function handleEditDish(dish) {
        setEditingDishId(dish.id);

        setDishForm({
            name: dish.name || '',
            slug: dish.slug || '',
            description: dish.description || '',
            ingredients: Array.isArray(dish.ingredients)
                ? dish.ingredients.join('\n')
                : '',
            steps: Array.isArray(dish.steps)
                ? dish.steps.join('\n')
                : '',
            price: String(dish.price ?? ''),
            image: dish.image || '',
            categoryId: dish.categoryId || dish.category?.id || '',
            isAvailable: Boolean(dish.isAvailable),
        });

        setDishError('');

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }

    function cancelDishEdit() {
        setEditingDishId(null);
        setDishForm(emptyDishForm);
        setDishError('');
    }

    // Taomni o‘chirish
    async function handleDeleteDish(dish) {
        const confirmed = window.confirm(
            `"${dish.name}" taomini o‘chirmoqchimisiz? Bu amalni qaytarib bo‘lmaydi.`
        );

        if (!confirmed) return;

        setDeletingDishId(dish.id);
        setDishError('');

        try {
            await deleteDish(dish.id);

            if (editingDishId === dish.id) {
                cancelDishEdit();
            }

            await refreshDishes();
        } catch (err) {
            setDishError(
                err.response?.data?.message ||
                'Taomni o‘chirib bo‘lmadi. U buyurtmalarda ishlatilgan bo‘lishi mumkin.'
            );
        } finally {
            setDeletingDishId(null);
        }
    }

    // Taom mavjudligini almashtirish
    async function toggleDishAvailability(dish) {
        setDishError('');

        try {
            await updateDish(dish.id, {
                isAvailable: !dish.isAvailable,
            });

            await refreshDishes();
        } catch (err) {
            setDishError(
                err.response?.data?.message ||
                'Taom holatini o‘zgartirib bo‘lmadi.'
            );
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

    const filteredDishes = dishes.filter((dish) => {
        const search = dishSearch.trim().toLowerCase();

        return (
            (dish.name || '').toLowerCase().includes(search) ||
            (dish.category?.name || '').toLowerCase().includes(search)
        );
    });

    const totalSales = orders
        .filter((order) => order.status === 'COMPLETED')
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

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
                        <h1>Admin panel</h1>
                        <p>Buyurtmalar, taomlar va stol band qilishlarni boshqaring.</p>
                    </div>

                    <div className="admin-actions">
                        {activeTab === 'orders' && (
                            <button
                                type="button"
                                onClick={refreshOrders}
                                disabled={ordersFetching}
                            >
                                {ordersFetching ? 'Yangilanmoqda...' : 'Yangilash'}
                            </button>
                        )}

                        {activeTab === 'dishes' && (
                            <button
                                type="button"
                                onClick={refreshDishes}
                                disabled={dishesLoading}
                            >
                                {dishesLoading ? 'Yangilanmoqda...' : 'Taomlarni yangilash'}
                            </button>
                        )}

                        <button type="button" onClick={handleLogout}>
                            Chiqish
                        </button>
                    </div>
                </header>

                <nav className="admin-tabs" aria-label="Admin bo‘limlari">
                    <button
                        type="button"
                        className={activeTab === 'orders' ? 'admin-tab active' : 'admin-tab'}
                        onClick={() => setActiveTab('orders')}
                        aria-pressed={activeTab === 'orders'}
                    >
                        Buyurtmalar va band qilishlar
                    </button>

                    <button
                        type="button"
                        className={activeTab === 'dishes' ? 'admin-tab active' : 'admin-tab'}
                        onClick={() => setActiveTab('dishes')}
                        aria-pressed={activeTab === 'dishes'}
                    >
                        Taomlarni boshqarish ({dishes.length})
                    </button>
                </nav>

                {error && (
                    <p className="admin-error" role="alert">
                        {error}
                    </p>
                )}

                {activeTab === 'orders' && (
                    <>
                        <div className="admin-stats">
                            {orderStats.map((stat) => (
                                <article className="admin-stat-card" key={stat.title}>
                                    <span className="admin-stat-icon">{stat.icon}</span>
                                    <p>{stat.title}</p>
                                    <h2>{stat.count}</h2>
                                </article>
                            ))}

                            <article className="admin-stat-card">
                                <span className="admin-stat-icon">💰</span>
                                <p>Jami savdo</p>
                                <h2>{totalSales.toLocaleString('uz-UZ')} so‘m</h2>
                            </article>
                        </div>

                        <section>
                            <h2>Buyurtmalar</h2>
                            <p>Jami buyurtmalar: {orders.length}</p>
                            <p>Ko‘rsatilmoqda: {filteredOrders.length}</p>

                            <div className="admin-filter">
                                <label htmlFor="status-filter">Holati bo‘yicha:</label>

                                <input
                                    className="admin-search"
                                    type="search"
                                    placeholder="Ism, telefon yoki buyurtma ID..."
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                />

                                <select
                                    id="status-filter"
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
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
                                            <p>Manzil: {order.address || 'Ko‘rsatilmagan'}</p>

                                            <label htmlFor={`status-${order.id}`}>
                                                Buyurtma holati
                                            </label>

                                            <select
                                                id={`status-${order.id}`}
                                                value={order.status}
                                                disabled={updatingOrderId === order.id}
                                                onChange={(event) =>
                                                    handleStatusChange(order.id, event.target.value)
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
                                                Jami: {Number(order.total).toLocaleString('uz-UZ')} so‘m
                                            </p>

                                            <h3>Taomlar</h3>

                                            {order.items?.map((item) => (
                                                <p key={item.id}>
                                                    {item.dish?.name || 'Taom'} × {item.quantity}
                                                </p>
                                            ))}
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="admin-bookings-section">
                            <h2>Stol band qilishlar</h2>
                            <p>Jami band qilishlar: {bookings.length}</p>

                            <button
                                type="button"
                                onClick={() => loadBookings()}
                                disabled={bookingsLoading}
                            >
                                {bookingsLoading
                                    ? 'Yuklanmoqda...'
                                    : 'Band qilishlarni yangilash'}
                            </button>

                            {bookingsLoading ? (
                                <p>Band qilishlar yuklanmoqda...</p>
                            ) : bookings.length === 0 ? (
                                <p>Hozircha stol band qilishlar yo‘q.</p>
                            ) : (
                                <div className="admin-orders">
                                    {bookings.map((booking) => (
                                        <article className="admin-order" key={booking.id}>
                                            <h3>{booking.name}</h3>
                                            <p>Telefon: {booking.phone}</p>
                                            <p>
                                                Sana: {new Date(booking.date).toLocaleDateString('uz-UZ')}
                                            </p>
                                            <p>Vaqt: {booking.time}</p>
                                            <p>Mehmonlar: {booking.guests} kishi</p>
                                            {booking.note && <p>Izoh: {booking.note}</p>}

                                            <p>
                                                Yaratilgan vaqt:{' '}
                                                {new Date(booking.createdAt).toLocaleString('uz-UZ')}
                                            </p>

                                            <label htmlFor={`booking-status-${booking.id}`}>
                                                Band qilish holati
                                            </label>

                                            <select
                                                id={`booking-status-${booking.id}`}
                                                value={booking.status}
                                                disabled={updatingBookingId === booking.id}
                                                onChange={(event) =>
                                                    handleBookingStatusChange(
                                                        booking.id,
                                                        event.target.value
                                                    )
                                                }
                                            >
                                                <option value="PENDING">Kutilmoqda</option>
                                                <option value="CONFIRMED">Tasdiqlandi</option>
                                                <option value="CANCELLED">Bekor qilindi</option>
                                            </select>

                                            {updatingBookingId === booking.id && (
                                                <p>Holat yangilanmoqda...</p>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}

                {activeTab === 'dishes' && (
                    <section className="admin-dishes-section">
                        <h2>{editingDishId ? 'Taomni tahrirlash' : 'Yangi taom qo‘shish'}</h2>

                        {dishError && (
                            <p className="admin-error" role="alert">
                                {dishError}
                            </p>
                        )}

                        {categories.length === 0 && !dishesLoading && (
                            <p className="admin-error">
                                Taom qo‘shish uchun avval bazada kamida bitta kategoriya bo‘lishi kerak.
                            </p>
                        )}

                        <form className="admin-dish-form" onSubmit={handleDishSubmit}>
                            <label htmlFor="dish-name">Taom nomi</label>
                            <input
                                id="dish-name"
                                name="name"
                                value={dishForm.name}
                                onChange={handleDishFieldChange}
                                placeholder="Masalan: O‘zbek palovi"
                                required
                            />

                            <label htmlFor="dish-slug">Slug</label>
                            <input
                                id="dish-slug"
                                name="slug"
                                value={dishForm.slug}
                                onChange={handleDishFieldChange}
                                placeholder="ozbek-palovi"
                                required
                            />

                            <label htmlFor="dish-price">Narxi (so‘m)</label>
                            <input
                                id="dish-price"
                                name="price"
                                type="number"
                                min="1"
                                step="1"
                                value={dishForm.price}
                                onChange={handleDishFieldChange}
                                placeholder="45000"
                                required
                            />

                            <label htmlFor="dish-image">Rasm URL manzili</label>
                            <input
                                id="dish-image"
                                name="image"
                                type="url"
                                value={dishForm.image}
                                onChange={handleDishFieldChange}
                                placeholder="https://example.com/dish.jpg"
                                required
                            />

                            {dishForm.image && (
                                <img
                                    src={dishForm.image}
                                    alt="Taom rasmi namunasi"
                                    style={{
                                        width: '180px',
                                        maxWidth: '100%',
                                        borderRadius: '12px',
                                        objectFit: 'cover',
                                    }}
                                    onError={(event) => {
                                        event.currentTarget.style.display = 'none';
                                    }}
                                    onLoad={(event) => {
                                        event.currentTarget.style.display = 'block';
                                    }}
                                />
                            )}

                            <label htmlFor="dish-category">Kategoriya</label>
                            <select
                                id="dish-category"
                                name="categoryId"
                                value={dishForm.categoryId}
                                onChange={handleDishFieldChange}
                                required
                            >
                                <option value="">Kategoriyani tanlang</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <label htmlFor="dish-description">Tavsif</label>
                            <textarea
                                id="dish-description"
                                name="description"
                                rows="3"
                                value={dishForm.description}
                                onChange={handleDishFieldChange}
                                placeholder="Taom haqida qisqacha ma’lumot..."
                                required
                            />

                            <label htmlFor="dish-ingredients">
                                Masalliqlar (har birini yangi qatordan yozing)
                            </label>
                            <textarea
                                id="dish-ingredients"
                                name="ingredients"
                                rows="4"
                                value={dishForm.ingredients}
                                onChange={handleDishFieldChange}
                                placeholder={'Guruch\nGo‘sht\nSabzi\nPiyoz'}
                                required
                            />

                            <label htmlFor="dish-steps">
                                Tayyorlash bosqichlari (har birini yangi qatordan yozing)
                            </label>
                            <textarea
                                id="dish-steps"
                                name="steps"
                                rows="5"
                                value={dishForm.steps}
                                onChange={handleDishFieldChange}
                                placeholder={'Masalliqlarni tayyorlang\nPishiring\nDasturxonga torting'}
                                required
                            />

                            <label>
                                <input
                                    name="isAvailable"
                                    type="checkbox"
                                    checked={dishForm.isAvailable}
                                    onChange={handleDishFieldChange}
                                />
                                Taom hozir buyurtma uchun mavjud
                            </label>

                            <div className="admin-dish-actions">
                                <button
                                    type="submit"
                                    disabled={savingDish || categories.length === 0}
                                >
                                    {savingDish
                                        ? 'Saqlanmoqda...'
                                        : editingDishId
                                            ? 'O‘zgarishlarni saqlash'
                                            : 'Taom qo‘shish'}
                                </button>

                                {editingDishId && (
                                    <button
                                        type="button"
                                        onClick={cancelDishEdit}
                                        disabled={savingDish}
                                    >
                                        Bekor qilish
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="admin-dishes-list">
                            <h2>Mavjud taomlar ({dishes.length})</h2>

                            <input
                                className="admin-search"
                                type="search"
                                value={dishSearch}
                                onChange={(event) => setDishSearch(event.target.value)}
                                placeholder="Taom yoki kategoriya bo‘yicha qidirish..."
                            />

                            {dishesLoading ? (
                                <p>Taomlar yuklanmoqda...</p>
                            ) : filteredDishes.length === 0 ? (
                                <p>Taomlar topilmadi.</p>
                            ) : (
                                <div className="admin-orders">
                                    {filteredDishes.map((dish) => (
                                        <article className="admin-order" key={dish.id}>
                                            {dish.image && (
                                                <img
                                                    src={dish.image}
                                                    alt={dish.name}
                                                    loading="lazy"
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '240px',
                                                        maxHeight: '170px',
                                                        objectFit: 'cover',
                                                        borderRadius: '12px',
                                                    }}
                                                />
                                            )}

                                            <h3>{dish.name}</h3>
                                            <p>Kategoriya: {dish.category?.name || 'Ko‘rsatilmagan'}</p>
                                            <p>Narxi: {Number(dish.price).toLocaleString('uz-UZ')} so‘m</p>
                                            <p>{dish.description}</p>
                                            <p>
                                                Holati:{' '}
                                                {dish.isAvailable
                                                    ? 'Buyurtma uchun mavjud'
                                                    : 'Hozir mavjud emas'}
                                            </p>

                                            <div className="admin-dish-actions">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditDish(dish)}
                                                >
                                                    Tahrirlash
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => toggleDishAvailability(dish)}
                                                >
                                                    {dish.isAvailable
                                                        ? 'Mavjud emas qilish'
                                                        : 'Mavjud qilish'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteDish(dish)}
                                                    disabled={deletingDishId === dish.id}
                                                >
                                                    {deletingDishId === dish.id
                                                        ? 'O‘chirilmoqda...'
                                                        : 'O‘chirish'}
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </section>
        </main>
    );
}
