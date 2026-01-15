import {useState, useEffect, useRef, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Calendar, User, Settings, LogOut, Home, Bell, Search, Plus,
    X, Loader2, Save, MapPin, AlertCircle, Camera, Trash2, Sun, Moon, Menu, CheckCircle,
    BarChart3, TrendingUp, ChevronDown, ChevronUp, Clock, CreditCard, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- Expresiones Regulares ---
const APARTMENT_REGEX = /^\d{1,2}[A-Z]$/; // Máximo 2 números seguidos de 1 letra
const POSTAL_CODE_REGEX = /^\d{5}$/;
const PHONE_REGEX = /^6\d{8}$/; // Empieza por 6 y tiene 9 dígitos total

// --- Tipos ---
interface Reservation {
    id: number;
    facility: string;
    start_time: string;
    end_time: string;
    status?: string;
    price: number; // Precio histórico guardado en BD
}

interface UserProfile {
    full_name: string;
    email: string;
    apartment: string;
    phone: string;
    postal_code?: string;
    address?: string;
    avatar_url?: string;
}

interface Notification {
    id: number;
    text: string;
    read: boolean;
    time: string;
}

type PhotonFeature = {
    properties: {
        name?: string;
        street?: string;
        housenumber?: string;
        postcode?: string;
        city?: string;
        state?: string;
    };
};

// Interfaz para la configuración dinámica de instalaciones
interface FacilityInfo {
    id: number;
    name: string;
    price: number;
    capacity: number;
    icon?: string;
    color?: string;
}

interface AvailabilitySlot {
    start: string;
    end: string;
    count: number;
    capacity: number;
}

// Interface para los gastos mensuales
interface MonthlyExpense {
    month: string;
    year: number;
    total: number;
    reservations: Reservation[];
    facilityBreakdown: { [key: string]: number };
}

const TIME_SLOTS = [
    "09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30", "21:00"
];

// Componente para mostrar el estado de la reserva
const StatusBadge = ({status}: { status?: string }) => {
    const statusValue = status || 'Confirmada';

    if (statusValue === 'Confirmada') {
        return (
            <div
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-xs font-semibold shadow-lg shadow-green-500/20 animate-pulse">
                <CheckCircle size={12} className="text-white"/>
                <span className="text-white">CONFIRMADA</span>
            </div>
        );
    }

    if (statusValue === 'Pendiente') {
        return (
            <div
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs font-semibold">
                <span>⏳</span>
                <span>PENDIENTE</span>
            </div>
        );
    }

    if (statusValue === 'Cancelada') {
        return (
            <div
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full text-xs font-semibold">
                <span>❌</span>
                <span>CANCELADA</span>
            </div>
        );
    }

    return (
        <div
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs font-semibold">
            <span>{statusValue}</span>
        </div>
    );
};

// Función auxiliar para convertir hora a minutos
const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// Mapeo dinámico de iconos y colores basado en palabras clave
const getFacilityAssets = (facilityName: string) => {
    const name = facilityName.toLowerCase();

    if (name.includes('padel') || name.includes('pádel')) {
        return { icon: '🎾', color: 'from-blue-500 to-cyan-500' };
    }
    if (name.includes('piscina')) {
        return { icon: '🏊', color: 'from-cyan-500 to-teal-500' };
    }
    if (name.includes('gimnasio') || name.includes('gym')) {
        return { icon: '💪', color: 'from-purple-500 to-pink-500' };
    }
    if (name.includes('sauna')) {
        return { icon: '🔥', color: 'from-orange-500 to-red-500' };
    }
    if (name.includes('sala') || name.includes('reunión')) {
        return { icon: '💼', color: 'from-indigo-500 to-purple-500' };
    }

    // Por defecto
    return { icon: '📍', color: 'from-gray-500 to-gray-600' };
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // --- Estados de Configuración (PERSISTENTES) ---
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved !== null ? JSON.parse(saved) : false;
    });

    // Referencias
    const toastShownRef = useRef(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const settingsFileInputRef = useRef<HTMLInputElement>(null);

    // Referencia para guardar los precios anteriores y detectar cambios
    const previousPricesRef = useRef<{ [key: string]: number }>({});

    // Estados UI
    const [showReserveModal, setShowReserveModal] = useState(false);
    const [showCompleteProfile, setShowCompleteProfile] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reservationToDelete, setReservationToDelete] = useState<number | null>(null);

    // Estados Datos
    const [user, setUser] = useState<UserProfile | null>(null);
    const [reservations, setReservations] = useState<Reservation[]>([]);

    // Configuración DINÁMICA de instalaciones (se carga del backend)
    const [facilitiesConfig, setFacilitiesConfig] = useState<{ [key: string]: FacilityInfo }>({});

    // Notificaciones persistentes
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return [{id: 1, text: "Bienvenido al sistema residencial", read: true, time: "Sistema"}];
            }
        }
        return [{id: 1, text: "Bienvenido al sistema residencial", read: true, time: "Sistema"}];
    });

    // Estados Carga
    const [loading, setLoading] = useState(true);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [deletingReservation, setDeletingReservation] = useState(false);

    // Reserva
    const [newResFacility, setNewResFacility] = useState(''); // Se inicializa al cargar configs
    const [newResDate, setNewResDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

    // Almacena disponibilidad por slot {hora: {count, capacity}}
    const [slotAvailability, setSlotAvailability] = useState<{ [key: string]: AvailabilitySlot }>({});
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Perfil
    const [profileForm, setProfileForm] = useState({phone: '', address: '', apartment: '', postal_code: ''});
    const [addressSuggestions, setAddressSuggestions] = useState<PhotonFeature[]>([]);
    const [showAddressMenu, setShowAddressMenu] = useState(false);

    // Gastos mensuales
    const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);
    const [expensesLoading, setExpensesLoading] = useState(false);
    const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
    const [expenseFilter, setExpenseFilter] = useState<'all' | 'last6' | 'currentYear'>('last6');

    // --- PERSISTIR DARK MODE ---
    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    // --- PERSISTIR NOTIFICACIONES ---
    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    // Función para transformar datos de instalaciones
    const transformFacilityData = (facilitiesData: any[]) => {
        const configMap: { [key: string]: FacilityInfo } = {};

        facilitiesData.forEach((fac: any) => {
            // Combinar datos del backend con assets dinámicos (iconos/colores)
            const assets = getFacilityAssets(fac.name);
            configMap[fac.name] = {
                ...fac,
                ...assets
            };
        });

        return configMap;
    };

    // --- 1. CARGAR DATOS (Usuario, Reservas e INSTALACIONES) ---
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const headers = {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'};

            // A. Cargar usuario
            const userResponse = await fetch('http://localhost:8000/api/v1/users/me', {headers});
            if (userResponse.status === 401) {
                handleLogout();
                return;
            }

            if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.avatar_url && !userData.avatar_url.startsWith('http')) {
                    userData.avatar_url = `http://localhost:8000${userData.avatar_url}`;
                }
                setUser(userData);

                if ((!userData.phone || !userData.address || !userData.apartment) && !showCompleteProfile) {
                    setProfileForm(prev => ({
                        phone: userData.phone || prev.phone,
                        address: userData.address || prev.address,
                        apartment: userData.apartment || prev.apartment,
                        postal_code: userData.postal_code || prev.postal_code
                    }));

                    if (!toastShownRef.current) {
                        setShowCompleteProfile(true);
                        toast("Por favor completa tu perfil para continuar", {icon: '📝', duration: 5000});
                        toastShownRef.current = true;
                    }
                }
            }

            // B. Cargar reservas del usuario
            const resResponse = await fetch('http://localhost:8000/api/v1/reservations/me', {headers});
            if (resResponse.ok) {
                const resData = await resResponse.json();
                const processedReservations = resData.map((res: any) => {
                    let finalPrice = res.price;

                    if ((!finalPrice || finalPrice === 0) && facilitiesConfig[res.facility]) {
                        finalPrice = facilitiesConfig[res.facility].price;
                    }

                    if (finalPrice === undefined || finalPrice === null) {
                        finalPrice = 0;
                    }

                    return {...res, price: finalPrice};
                });

                const sortedRes = processedReservations.sort((a: Reservation, b: Reservation) =>
                    new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
                );
                setReservations(sortedRes);
            }

        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    }, [navigate, showCompleteProfile, facilitiesConfig]);

    // --- Función para cargar PRECIOS específicamente ---
    const fetchPrices = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const headers = {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'};
            const facilitiesResponse = await fetch('http://localhost:8000/api/v1/reservations/facilities', {headers});

            if (facilitiesResponse.ok) {
                const facilitiesData = await facilitiesResponse.json();
                const configMap = transformFacilityData(facilitiesData);

                // Detectar cambios en los precios
                const priceChanges: { [key: string]: { old: number, new: number } } = {};
                Object.keys(configMap).forEach(facilityName => {
                    const oldPrice = previousPricesRef.current[facilityName];
                    const newPrice = configMap[facilityName].price;

                    if (oldPrice !== undefined && oldPrice !== newPrice) {
                        priceChanges[facilityName] = {old: oldPrice, new: newPrice};
                    }

                    // Actualizar referencia
                    previousPricesRef.current[facilityName] = newPrice;
                });

                // Actualizar estado
                setFacilitiesConfig(configMap);

                // Mostrar notificación si hay cambios de precio
                if (Object.keys(priceChanges).length > 0) {
                    Object.entries(priceChanges).forEach(([facility, prices]) => {
                        if (prices.old < prices.new) {
                            // Precio aumentó
                            toast(`🔼 ${facility}: ${prices.old}€ → ${prices.new}€`, {
                                duration: 3000,
                                icon: '📈',
                                style: {
                                    background: isDarkMode ? '#1f2937' : '#f3f4f6',
                                    color: isDarkMode ? '#fff' : '#111827',
                                    border: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db'
                                }
                            });
                        } else if (prices.old > prices.new) {
                            // Precio bajó
                            toast(`🔽 ${facility}: ${prices.old}€ → ${prices.new}€`, {
                                duration: 3000,
                                icon: '📉',
                                style: {
                                    background: isDarkMode ? '#1f2937' : '#f3f4f6',
                                    color: isDarkMode ? '#fff' : '#111827',
                                    border: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db'
                                }
                            });
                        }
                    });
                }

                // Si no hay instalación seleccionada, seleccionar la primera
                if (!newResFacility && facilitiesData.length > 0) {
                    setNewResFacility(facilitiesData[0].name);
                }
            }
        } catch (error) {
            console.error("Error fetching prices", error);
        }
    }, [isDarkMode, newResFacility]);

    // --- Polling automático para DATOS GENERALES (cada 4s) ---
    useEffect(() => {
        fetchData();
        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchData();
            }
        }, 4000); // Cambiado de 30s a 4s
        return () => clearInterval(intervalId);
    }, [fetchData]);

    // --- Polling automático para PRECIOS (cada 4s) ---
    useEffect(() => {
        // Cargar precios inicialmente
        fetchPrices();

        // Configurar intervalo de 4 segundos
        const priceIntervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchPrices();
            }
        }, 4000);

        return () => clearInterval(priceIntervalId);
    }, [fetchPrices]);

    // --- 2. Notificaciones de Pago ---
    useEffect(() => {
        const paymentSuccess = localStorage.getItem('paymentSuccess');

        if (paymentSuccess) {
            const newNotif = {
                id: Date.now(),
                text: "¡Reserva confirmada exitosamente!",
                read: false,
                time: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})
            };

            setNotifications(prev => [newNotif, ...prev]);
            localStorage.removeItem('paymentSuccess');
            setShowNotifications(true);
            setTimeout(() => setShowNotifications(false), 4000);

            // Recargar datos después de reserva exitosa
            fetchData();
            fetchPrices(); // También actualizar precios
        }
    }, [fetchData]);

    // --- 3. Cargar Disponibilidad cuando se abre el modal ---
    useEffect(() => {
        if (!showReserveModal || !newResFacility) {
            setSlotAvailability({});
            setSelectedTimeSlot(null);
            return;
        }

        const fetchAvailability = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `http://localhost:8000/api/v1/reservations/availability?facility=${encodeURIComponent(newResFacility)}&date_str=${newResDate}`,
                    {headers: {'Authorization': `Bearer ${token}`}}
                );

                if (response.ok) {
                    const data: AvailabilitySlot[] = await response.json();

                    // Convertir a mapa por hora
                    const availabilityMap: { [key: string]: AvailabilitySlot } = {};

                    data.forEach((slot) => {
                        const date = new Date(slot.start);
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        const timeKey = `${hours}:${minutes}`;

                        // Usamos la capacidad dinámica que viene del backend o de la config cargada
                        const currentCapacity = slot.capacity || facilitiesConfig[newResFacility]?.capacity || 1;

                        availabilityMap[timeKey] = {
                            ...slot,
                            capacity: currentCapacity
                        };
                    });

                    setSlotAvailability(availabilityMap);
                }
            } catch (error) {
                console.error("Error fetching availability", error);
            } finally {
                setLoadingSlots(false);
            }
        };

        setLoadingSlots(true);
        fetchAvailability();

        const interval = setInterval(fetchAvailability, 4000);
        return () => clearInterval(interval);
    }, [newResFacility, newResDate, showReserveModal, facilitiesConfig]);

    // --- 4. Función para verificar si el usuario ya tiene reserva ---
    const userAlreadyHasReservation = useCallback((slotTime: string): boolean => {
        if (!reservations.length) return false;

        const selectedDate = new Date(newResDate);
        const selectedTime = timeToMinutes(slotTime);

        return reservations.some(reservation => {
            const resDate = new Date(reservation.start_time);
            const resTime = timeToMinutes(
                `${String(resDate.getHours()).padStart(2, '0')}:${String(resDate.getMinutes()).padStart(2, '0')}`
            );

            const sameDate =
                resDate.getFullYear() === selectedDate.getFullYear() &&
                resDate.getMonth() === selectedDate.getMonth() &&
                resDate.getDate() === selectedDate.getDate();

            const sameFacility = reservation.facility === newResFacility;
            const timeDifference = Math.abs(resTime - selectedTime);
            const sameTimeSlot = timeDifference < 90;

            return sameDate && sameFacility && sameTimeSlot;
        });
    }, [reservations, newResDate, newResFacility]);

    // --- 5. Autocompletado Dirección ---
    useEffect(() => {
        if (profileForm.address.length < 3 || !showAddressMenu) {
            setAddressSuggestions([]);
            return;
        }
        const timeoutId = setTimeout(async () => {
            try {
                const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(profileForm.address)}&limit=5`);
                if (response.ok) {
                    const data = await response.json();
                    setAddressSuggestions(data.features || []);
                }
            } catch (error) {
                console.error(error);
            }
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [profileForm.address, showAddressMenu]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setAddressSuggestions([]);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- 6. Calcular gastos mensuales (VERSIÓN CORREGIDA) ---
    useEffect(() => {
        if (reservations.length === 0) {
            setMonthlyExpenses([]);
            return;
        }

        setExpensesLoading(true);
        try {
            const expensesByMonth: { [key: string]: MonthlyExpense } = {};

            reservations.forEach(reservation => {
                // Usamos el precio HISTÓRICO guardado en la reserva
                // Si no tiene precio, no lo incluimos en los gastos
                if (reservation.price && reservation.price > 0) {
                    const date = new Date(reservation.start_time);
                    const month = date.toLocaleDateString('es-ES', {month: 'long'});
                    const year = date.getFullYear();
                    const key = `${year}-${date.getMonth() + 1}`; // Añadimos +1 porque getMonth() es 0-indexed

                    if (!expensesByMonth[key]) {
                        expensesByMonth[key] = {
                            month: month.charAt(0).toUpperCase() + month.slice(1),
                            year,
                            total: 0,
                            reservations: [],
                            facilityBreakdown: {}
                        };
                    }

                    expensesByMonth[key].total += reservation.price;
                    expensesByMonth[key].reservations.push(reservation);

                    if (!expensesByMonth[key].facilityBreakdown[reservation.facility]) {
                        expensesByMonth[key].facilityBreakdown[reservation.facility] = 0;
                    }
                    expensesByMonth[key].facilityBreakdown[reservation.facility] += reservation.price;
                }
            });

            const expensesArray = Object.values(expensesByMonth)
                .sort((a, b) => {
                    if (a.year !== b.year) return b.year - a.year;
                    const monthOrder = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                    return monthOrder.indexOf(b.month.toLowerCase()) - monthOrder.indexOf(a.month.toLowerCase());
                });

            console.log("Gastos calculados:", expensesArray); // Para depuración
            setMonthlyExpenses(expensesArray);
        } catch (error) {
            console.error("Error calculando gastos mensuales", error);
        } finally {
            setExpensesLoading(false);
        }
    }, [reservations]);

    // --- Handlers de Input ---
    const handleApartmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.toUpperCase();
        value = value.replace(/[^0-9A-Z]/g, '');
        if (value.length > 3) value = value.substring(0, 3);
        const match = value.match(/^(\d{0,2})([A-Z]?)$/);
        if (match) {
            setProfileForm(prev => ({...prev, apartment: match[1] + match[2]}));
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value && value.charAt(0) !== '6') value = '6' + value.substring(1);
        if (value.length > 9) value = value.substring(0, 9);
        setProfileForm(prev => ({...prev, phone: value}));
    };

    const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) value = value.substring(0, 5);
        setProfileForm(prev => ({...prev, postal_code: value}));
    };

    const handleSelectAddress = (feature: PhotonFeature) => {
        const p = feature.properties;
        const fullAddress = `${p.street || p.name || ""} ${p.housenumber || ""}, ${p.city || ""}`;
        setProfileForm(prev => ({
            ...prev,
            address: fullAddress,
            postal_code: p.postcode || prev.postal_code
        }));
        setAddressSuggestions([]);
        setShowAddressMenu(false);
    };

    // --- 7. Avatar (MinIO) ---
    const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
        ref.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error("Formato de imagen no válido");
            return;
        }

        setUploadingAvatar(true);
        const loadingToast = toast.loading("Subiendo foto...");

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:8000/api/v1/users/me/avatar', {
                method: 'POST',
                headers: {'Authorization': `Bearer ${token}`},
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                const avatarUrl = data.avatar_url.startsWith('http')
                    ? data.avatar_url
                    : `http://localhost:8000${data.avatar_url}`;

                setUser(prev => prev ? {...prev, avatar_url: avatarUrl} : null);
                toast.success("Foto actualizada", {id: loadingToast});
            } else {
                throw new Error("Fallo en la subida");
            }
        } catch (error) {
            toast.error("Error al subir imagen", {id: loadingToast});
        } finally {
            setUploadingAvatar(false);
        }
    };

    // --- 8. BORRAR RESERVA ---
    const handleDeleteReservation = async (reservationId: number) => {
        setDeletingReservation(true);
        const loadingToast = toast.loading("Eliminando reserva...");

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/v1/reservations/${reservationId}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${token}`}
            });

            if (response.ok) {
                setReservations(prev => prev.filter(res => res.id !== reservationId));

                const newNotif = {
                    id: Date.now(),
                    text: "Reserva cancelada correctamente",
                    read: false,
                    time: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})
                };

                setNotifications(prev => [newNotif, ...prev]);
                setShowNotifications(true); // Opcional: mostrar notificación visual
                setTimeout(() => setShowNotifications(false), 4000);

                toast.success("Reserva eliminada correctamente", {id: loadingToast});
                setShowDeleteModal(false);
                setReservationToDelete(null);

                fetchData();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Error al eliminar");
            }
        } catch (error) {
            toast.error(`No se pudo eliminar la reserva: ${error instanceof Error ? error.message : 'Error desconocido'}`, {id: loadingToast});
        } finally {
            setDeletingReservation(false);
        }
    };

    // --- 10. Buscador ---
    const filteredReservations = reservations.filter(res => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const date = new Date(res.start_time).toLocaleDateString();
        return res.facility.toLowerCase().includes(query) || date.includes(query);
    });

    // --- 11. Funciones para gastos mensuales ---
    const getExpenseStats = () => {
        if (monthlyExpenses.length === 0) return null;

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().toLocaleDateString('es-ES', {month: 'long'});

        let filteredExpenses = monthlyExpenses;
        if (expenseFilter === 'currentYear') {
            filteredExpenses = monthlyExpenses.filter(exp => exp.year === currentYear);
        } else if (expenseFilter === 'last6') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            filteredExpenses = monthlyExpenses.filter(exp => {
                const expDate = new Date(exp.year, new Date(`${exp.month} 1, ${exp.year}`).getMonth());
                return expDate >= sixMonthsAgo;
            });
        }

        const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.total, 0);
        const avgMonthly = filteredExpenses.length > 0 ? totalSpent / filteredExpenses.length : 0;

        const currentMonthExpense = monthlyExpenses.find(
            exp => exp.year === currentYear && exp.month.toLowerCase() === currentMonth.toLowerCase()
        );

        let trend = 0;
        let trendText = "Sin datos previos";

        if (filteredExpenses.length >= 2) {
            const current = filteredExpenses[0]?.total || 0;
            const previous = filteredExpenses[1]?.total || 0;

            if (previous > 0) {
                trend = ((current - previous) / previous) * 100;
                trendText = `${trend >= 0 ? '+' : ''}${trend.toFixed(1)}% vs mes anterior`;
            }
        }

        return {
            totalSpent,
            avgMonthly,
            currentMonth: currentMonthExpense?.total || 0,
            trend,
            trendText,
            count: filteredExpenses.length,
            filteredExpenses
        };
    };

    const toggleExpandMonth = (monthKey: string) => {
        setExpandedMonths(prev =>
            prev.includes(monthKey)
                ? prev.filter(key => key !== monthKey)
                : [...prev, monthKey]
        );
    };

    const getFacilityColor = (facility: string) => {
        const colors: { [key: string]: string } = {
            'pádel': 'bg-blue-500',
            'piscina': 'bg-cyan-500',
            'gimnasio': 'bg-purple-500',
            'sauna': 'bg-orange-500'
        };

        const key = Object.keys(colors).find(colorKey =>
            facility.toLowerCase().includes(colorKey)
        );

        return colors[key || 'pádel'] || 'bg-gray-500';
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('paymentSuccess');
        localStorage.removeItem('reservationCancelled');
        navigate('/login');
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profileForm.phone.trim() || !profileForm.apartment.trim() || !profileForm.address.trim()) {
            toast.error("Todos los campos son obligatorios");
            return;
        }

        if (!PHONE_REGEX.test(profileForm.phone)) {
            toast.error("Teléfono inválido. Debe empezar por 6 y tener 9 dígitos.");
            return;
        }

        if (!APARTMENT_REGEX.test(profileForm.apartment)) {
            toast.error("Apartamento inválido. Formato: Número(s) + Letra (Ej: 4B, 12C). Máximo 2 números.");
            return;
        }

        if (!POSTAL_CODE_REGEX.test(profileForm.postal_code)) {
            toast.error("Código Postal debe ser 5 dígitos.");
            return;
        }

        if (profileForm.address.trim().length < 5 || /^\d+$/.test(profileForm.address)) {
            toast.error("Dirección no válida.");
            return;
        }

        setUpdatingProfile(true);
        const loadingToast = toast.loading("Guardando...");

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/v1/users/me', {
                method: 'PUT',
                headers: {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    phone: profileForm.phone,
                    address: profileForm.address,
                    apartment: profileForm.apartment,
                    postal_code: profileForm.postal_code
                })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                setShowCompleteProfile(false);
                toast.success("¡Perfil actualizado correctamente!", {id: loadingToast});
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Error al actualizar");
            }
        } catch (err) {
            toast.error(`Error: ${err instanceof Error ? err.message : 'Error de conexión'}`, {id: loadingToast});
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleCreateReservation = () => {
        if (!selectedTimeSlot) {
            toast.error("Selecciona un horario");
            return;
        }
        if (!user?.apartment || !user?.phone) {
            toast.error("Perfil incompleto");
            setShowCompleteProfile(true);
            return;
        }

        const selectedDate = new Date(newResDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            toast.error("No se pueden reservar fechas pasadas");
            return;
        }

        if (userAlreadyHasReservation(selectedTimeSlot)) {
            toast.error("Ya tienes una reserva en este horario para esta instalación");
            return;
        }

        const startDateTime = new Date(`${newResDate}T${selectedTimeSlot}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 90 * 60000);
        const endTimeString = endDateTime.toTimeString().slice(0, 5);
        const displayDate = startDateTime.toLocaleDateString('es-ES', {day: 'numeric', month: 'long', year: 'numeric'});

        // Obtener precio DINÁMICO de la configuración cargada
        const facilityInfo = facilitiesConfig[newResFacility];
        const priceBase = facilityInfo ? facilityInfo.price : 15.00;
        const tax = priceBase * 0.21;
        const total = priceBase + tax;

        // Verificar capacidad
        const slotInfo = slotAvailability[selectedTimeSlot];
        const currentCapacity = slotInfo?.capacity || facilityInfo?.capacity || 1;
        const currentCount = slotInfo?.count || 0;

        if (currentCount >= currentCapacity) {
            toast.error(`¡Capacidad completa! Ya no hay plazas disponibles.`);
            return;
        }

        setShowReserveModal(false);
        navigate('/payment', {
            state: {
                reservationData: {
                    facility: newResFacility,
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString()
                },
                displayData: {
                    facility: newResFacility,
                    date: displayDate,
                    time: `${selectedTimeSlot} - ${endTimeString}`,
                    duration: '1h 30m',
                    price: priceBase,
                    tax,
                    total
                }
            }
        });
    };

    const getMinDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    if (loading) return <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
        <Loader2 className="animate-spin text-purple-500" size={48}/>
    </div>;

    // Obtener información de la instalación seleccionada para el modal
    const selectedFacilityInfo = facilitiesConfig[newResFacility];
    const facilityIcon = selectedFacilityInfo?.icon || '📍';
    const facilityColor = selectedFacilityInfo?.color || 'from-blue-500 to-cyan-500';

    return (
        <div
            className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} relative`}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .glass { 
          background: ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)'}; 
          backdrop-filter: blur(20px); 
          border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}; 
          ${!isDarkMode && 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);'}
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scheme-dark { color-scheme: dark; }
        .scheme-light { color-scheme: light; }
      `}</style>

            {/* Botón menú móvil */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`md:hidden fixed top-6 left-4 z-50 p-3 rounded-full glass ${isDarkMode ? 'text-white border-white/10' : 'text-gray-800 border-gray-200'} border cursor-pointer transition-transform duration-300 ${sidebarOpen ? 'translate-x-64' : 'translate-x-0'}`}
            >
                <Menu size={24}/>
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen w-64 glass border-r ${isDarkMode ? 'border-white/10 bg-gray-900' : 'border-gray-200 bg-white'} p-6 z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0`}>
                <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => {
                    setActiveTab('home');
                    setSidebarOpen(false);
                }}>
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}>
                        <span className={`font-bold ${isDarkMode ? 'text-black' : 'text-white'}`}>R</span>
                    </div>
                    <span
                        className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>RESIDENCIAL</span>
                </div>

                <nav className="space-y-2">
                    {[
                        {id: 'home', icon: <Home size={20}/>, label: 'Inicio'},
                        {id: 'reservations', icon: <Calendar size={20}/>, label: 'Mis Reservas'},
                        {id: 'book', icon: <Plus size={20}/>, label: 'Nueva Reserva'},
                        {id: 'profile', icon: <User size={20}/>, label: 'Perfil'},
                        {id: 'settings', icon: <Settings size={20}/>, label: 'Configuración'},
                        {id: 'expenses', icon: <BarChart3 size={20}/>, label: 'Mis Gastos'}
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border-none cursor-pointer ${activeTab === item.id
                                ? (isDarkMode ? 'bg-white text-black' : 'bg-gray-900 text-white')
                                : (isDarkMode ? 'text-gray-200 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
                            }`}
                        >
              <span
                  className={`${activeTab === item.id ? (isDarkMode ? 'text-black' : 'text-white') : (isDarkMode ? 'text-gray-200' : 'text-gray-600')}`}>
                {item.icon}
              </span>
                            <span
                                className={`font-medium ${activeTab === item.id ? (isDarkMode ? 'text-black' : 'text-white') : (isDarkMode ? 'text-gray-200' : 'text-gray-700')}`}>
                {item.label}
              </span>
                        </button>
                    ))}
                </nav>

                <button onClick={handleLogout}
                        className={`absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 transition cursor-pointer bg-transparent border-none ${isDarkMode ? 'text-gray-200 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    <LogOut size={20}/>
                    <span>Cerrar sesión</span>
                </button>
            </aside>

            {/* Overlay para móvil */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
                <header className="flex justify-between items-center mb-8 md:mb-12">
                    <div className="md:ml-0 ml-12 md:ml-0">
                        <h1 className={`text-2xl md:text-4xl font-light mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {activeTab === 'home' && 'Bienvenido de nuevo'}
                            {activeTab === 'reservations' && 'Mis Reservas'}
                            {activeTab === 'book' && 'Nueva Reserva'}
                            {activeTab === 'profile' && 'Mi Perfil'}
                            {activeTab === 'settings' && 'Configuración'}
                            {activeTab === 'expenses' && 'Mis Gastos Mensuales'}
                        </h1>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} text-sm`}>
                            {new Date().toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="relative group hidden md:block">
                            <div
                                className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                <Search size={18}/>
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar reservas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`glass pl-10 pr-4 py-3 rounded-full text-sm placeholder-gray-500 focus:outline-none transition-all w-48 focus:w-64 border-none ${isDarkMode ? 'text-white focus:bg-white/10' : 'text-gray-900 focus:bg-black/5'}`}
                            />
                        </div>

                        {/* Notificaciones */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`glass p-2 md:p-3 rounded-full transition relative bg-transparent border-none cursor-pointer ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-gray-800'}`}
                            >
                                <Bell size={18}/>
                                {notifications.some(n => !n.read) && <span
                                    className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                            </button>
                            {showNotifications && (
                                <div
                                    className="absolute right-0 top-12 md:top-14 w-80 glass rounded-xl border border-white/10 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                    <div
                                        className={`p-4 border-b flex justify-between items-center ${isDarkMode ? 'border-white/10 text-white' : 'border-gray-200 text-gray-900'}`}>
                                        <span className="font-medium">Notificaciones</span>
                                        <button
                                            className="text-xs text-purple-400 bg-transparent border-none cursor-pointer"
                                            onClick={() => setNotifications(prev => prev.map(n => ({
                                                ...n,
                                                read: true
                                            })))}>Marcar leídas
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <p className="p-4 text-center text-sm text-gray-500">No hay
                                                notificaciones</p>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id}
                                                     className={`p-4 border-b transition ${isDarkMode ? 'border-white/5 hover:bg-white/5 text-white' : 'border-gray-100 hover:bg-gray-50 text-gray-800'} ${!n.read ? (isDarkMode ? 'bg-white/5' : 'bg-gray-50') : ''}`}>
                                                    <p className="text-sm">{n.text}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div onClick={() => setActiveTab('profile')}
                             className={`glass px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center gap-2 md:gap-3 cursor-pointer transition ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-gray-800'}`}>
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Avatar"
                                     className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover"/>
                            ) : (
                                <div
                                    className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs md:text-sm font-bold text-white">
                                    {user?.full_name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <span className="text-sm font-medium hidden md:inline">{user?.full_name || 'Usuario'}</span>
                        </div>
                    </div>
                </header>

                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <div className="glass p-4 md:p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                        <Calendar className="text-blue-400" size={20}/>
                                    </div>
                                    <div>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Reservas
                                            totales</p>
                                        <p className="text-2xl md:text-3xl font-light">{reservations.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="glass p-4 md:p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                        <TrendingUp className="text-green-400" size={20}/>
                                    </div>
                                    <div>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Precios
                                            actualizados</p>
                                        <p className="text-2xl md:text-3xl font-light">Cada 4s</p>
                                    </div>
                                </div>
                            </div>
                            <div className="glass p-4 md:p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                                        <Bell className="text-purple-400" size={20}/>
                                    </div>
                                    <div>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Notificaciones</p>
                                        <p className="text-2xl md:text-3xl font-light">{notifications.filter(n => !n.read).length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass p-4 md:p-8 rounded-2xl">
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                                <h2 className={`text-xl md:text-2xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Mis
                                    reservas
                                    recientes {searchQuery && "(Filtrado)"}</h2>
                            </div>
                            <div className="space-y-3 md:space-y-4">
                                {filteredReservations.length === 0 ? (
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No tienes
                                        reservas activas.</p>
                                ) : (
                                    filteredReservations.slice(0, 3).map((res) => (
                                        <div key={res.id}
                                             className={`flex items-center justify-between p-3 md:p-4 rounded-xl border transition ${isDarkMode ? 'bg-white/5 hover:border-white/10 border-white/5' : 'bg-gray-100 hover:border-gray-300 border-gray-200'}`}>
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div
                                                    className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                                                    <Calendar size={16}/>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{res.facility}</p>
                                                    <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {new Date(res.start_time).toLocaleDateString()} • {new Date(res.start_time).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                    </p>
                                                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                                                        Pagado: {res.price.toFixed(2)}€
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge status={res.status}/>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="glass p-4 md:p-6 rounded-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className={`text-xl md:text-2xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Instalaciones
                                    Disponibles</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                {Object.values(facilitiesConfig).map((facility, i) => (
                                    <button key={i} onClick={() => {
                                        setNewResFacility(facility.name);
                                        setShowReserveModal(true);
                                    }}
                                            className={`glass p-4 md:p-6 rounded-2xl transition group cursor-pointer border-none ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'}`}>
                                        <div
                                            className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${facility.color} rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-3 md:mb-4 mx-auto group-hover:scale-110 transition text-white`}>
                                            {facility.icon}
                                        </div>
                                        <p className="text-xs md:text-sm font-medium text-center">{facility.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{facility.price}€ •
                                            Capacidad: {facility.capacity}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* RESERVATIONS TAB */}
                {activeTab === 'reservations' && (
                    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
                        {filteredReservations.length === 0 ? (
                            <div className="glass p-8 md:p-12 text-center rounded-2xl">
                                <Calendar className="mx-auto text-gray-500 mb-4" size={32}/>
                                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No tienes reservas
                                    activas.</p>
                            </div>
                        ) : (
                            filteredReservations.map((res) => (
                                <div key={res.id}
                                     className={`glass p-4 md:p-6 rounded-2xl transition border flex justify-between items-center ${isDarkMode ? 'hover:bg-white/10 border-white/5' : 'hover:bg-gray-100 border-gray-200'}`}>
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div
                                            className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                                            <Calendar size={20}/>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className={`text-lg md:text-xl font-medium mb-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{res.facility}</h3>
                                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-xs md:text-sm`}>
                                                {new Date(res.start_time).toLocaleDateString()} {new Date(res.start_time).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })} - {new Date(res.end_time).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            </p>
                                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                                                Precio pagado: {res.price.toFixed(2)}€
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row items-end md:items-center gap-3 md:gap-4">
                                        <StatusBadge status={res.status}/>
                                        {/* BOTÓN DE ELIMINAR RESERVA RESTAURADO */}
                                        <button
                                            onClick={() => {
                                                setReservationToDelete(res.id);
                                                setShowDeleteModal(true);
                                            }}
                                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-full transition bg-transparent border-none cursor-pointer">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* BOOK TAB */}
                {activeTab === 'book' && (
                    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                        <div className="glass p-6 md:p-8 rounded-2xl text-center">
                            <h2 className={`text-xl md:text-2xl font-light mb-4 md:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Realizar
                                nueva reserva</h2>
                            <button onClick={() => setShowReserveModal(true)}
                                    className={`px-6 py-3 md:px-8 md:py-4 rounded-full font-medium transition text-base md:text-lg cursor-pointer border-none ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>Abrir
                                formulario
                            </button>
                        </div>
                    </div>
                )}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && user && (
                    <div
                        className={`max-w-4xl glass p-4 md:p-8 rounded-2xl mb-8 animate-in fade-in duration-500 ${isDarkMode ? '' : 'bg-white'}`}>
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-6 md:mb-8">
                            <div className="relative group">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="Avatar"
                                         className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white/10"/>
                                ) : (
                                    <div
                                        className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold text-white border-4 border-white/10">
                                        {user.full_name?.charAt(0)}
                                    </div>
                                )}
                                <button
                                    onClick={() => triggerFileInput(fileInputRef)}
                                    className={`absolute bottom-0 right-0 p-1.5 md:p-2 rounded-full transition cursor-pointer border-none shadow-lg ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                                    disabled={uploadingAvatar}
                                >
                                    {uploadingAvatar ? <Loader2 size={14} className="animate-spin"/> :
                                        <Camera size={14}/>}
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*"
                                       onChange={handleAvatarChange}/>
                            </div>

                            <div>
                                <h2 className={`text-2xl md:text-3xl font-light mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.full_name}</h2>
                                <div
                                    className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${isDarkMode ? 'bg-white/10 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                                    <Home size={12}/>
                                    <span className="text-xs md:text-sm">Apartamento {user.apartment}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div>
                                <label
                                    className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Email</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    className={`w-full border rounded-lg px-3 py-2 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label
                                    className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Teléfono</label>
                                <input
                                    type="text"
                                    value={user.phone || 'No registrado'}
                                    className={`w-full border rounded-lg px-3 py-2 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label
                                    className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Dirección</label>
                                <input
                                    type="text"
                                    value={user.address || 'No registrado'}
                                    className={`w-full border rounded-lg px-3 py-2 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label
                                    className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>CP</label>
                                <input
                                    type="text"
                                    value={user.postal_code || 'No registrado'}
                                    className={`w-full border rounded-lg px-3 py-2 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div
                            className={`mt-6 md:mt-8 pt-4 md:pt-6 border-t flex justify-end ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                            <button onClick={() => setShowCompleteProfile(true)}
                                    className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-2 rounded-lg transition border-none cursor-pointer ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}>
                                <Settings size={14}/> Editar Datos
                            </button>
                        </div>
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div
                        className={`max-w-2xl glass p-4 md:p-8 rounded-2xl animate-in fade-in duration-500 ${isDarkMode ? '' : 'bg-white'}`}>
                        <h2 className={`text-xl md:text-2xl font-light mb-4 md:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Configuración</h2>

                        <div
                            className={`flex flex-col md:flex-row md:items-center gap-4 mb-6 md:mb-8 p-4 rounded-xl border border-dashed ${isDarkMode ? 'border-gray-700 bg-white/5 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'}`}>
                            <div className="relative">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="Profile"
                                         className="w-16 h-16 rounded-full object-cover"/>
                                ) : (
                                    <div
                                        className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl font-bold text-white">
                                        {user?.full_name?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <input type="file" ref={settingsFileInputRef} className="hidden" accept="image/*"
                                       onChange={handleAvatarChange}/>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Foto de Perfil</p>
                                <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Personaliza
                                    tu avatar visible para la
                                    comunidad.</p>
                                <button
                                    onClick={() => triggerFileInput(settingsFileInputRef)}
                                    className={`text-xs px-3 py-1 rounded-md transition ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                                    disabled={uploadingAvatar}
                                >
                                    {uploadingAvatar ? 'Subiendo...' : 'Cambiar Foto'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div
                                className={`flex items-center justify-between p-4 rounded-xl transition ${isDarkMode ? 'bg-white/5 text-white' : 'bg-white border border-gray-100 shadow-sm text-gray-900'}`}>
                                <div className="flex items-center gap-3">
                                    {isDarkMode ? <Moon size={20} className="text-purple-400"/> :
                                        <Sun size={20} className="text-orange-500"/>}
                                    <div>
                                        <p className="font-medium">Modo Oscuro</p>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{isDarkMode ? 'Activado' : 'Desactivado'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 border-none cursor-pointer ${isDarkMode ? 'bg-purple-600' : 'bg-gray-300'}`}
                                >
                                    <div
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <button
                                onClick={() => setActiveTab('expenses')}
                                className={`w-full p-4 text-purple-400 hover:bg-purple-500/10 rounded-xl transition text-left border border-purple-500/20 bg-transparent cursor-pointer flex items-center gap-2 ${isDarkMode ? '' : 'hover:bg-purple-50'}`}
                            >
                                <BarChart3 size={20}/> Ver mis gastos mensuales
                            </button>
                        </div>
                    </div>
                )}

                {/* EXPENSES TAB */}
                {activeTab === 'expenses' && (
                    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                        {/* Encabezado y estadísticas */}
                        <div className="glass p-6 rounded-2xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className={`text-2xl font-light mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Mis Gastos Mensuales
                                    </h2>
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Resumen de todos tus gastos en instalaciones
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <select
                                        value={expenseFilter}
                                        onChange={(e) => setExpenseFilter(e.target.value as any)}
                                        className={`px-4 py-2 rounded-lg border text-sm cursor-pointer ${isDarkMode
                                            ? 'bg-white/5 border-white/10 text-white'
                                            : 'bg-white border-gray-200 text-gray-900'}`}
                                    >
                                        <option value="all">Todos los meses</option>
                                        <option value="last6">Últimos 6 meses</option>
                                        <option value="currentYear">Año actual</option>
                                    </select>
                                </div>
                            </div>

                            {expensesLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-purple-500" size={32}/>
                                </div>
                            ) : monthlyExpenses.length === 0 ? (
                                <div className="text-center py-8">
                                    <BarChart3
                                        className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}
                                        size={48}/>
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        No hay gastos registrados todavía
                                    </p>
                                    <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Realiza tu primera reserva para comenzar a ver tus gastos aquí
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Estadísticas rápidas */}
                                    {(() => {
                                        const stats = getExpenseStats();
                                        if (!stats) return null;

                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                                <div className={`p-4 rounded-xl border ${isDarkMode
                                                    ? 'bg-white/5 border-white/10 text-white'
                                                    : 'bg-white border-gray-200 text-gray-900'}`}>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div
                                                            className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                                            <TrendingUp size={20} className="text-white"/>
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Gasto
                                                                total</p>
                                                            <p className="text-2xl font-bold">{stats.totalSpent.toFixed(2)}€</p>
                                                        </div>
                                                    </div>
                                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {stats.count} {stats.count === 1 ? 'mes' : 'meses'} • {stats.filteredExpenses.length} {stats.filteredExpenses.length === 1 ? 'reserva' : 'reservas'}
                                                    </p>
                                                </div>

                                                <div className={`p-4 rounded-xl border ${isDarkMode
                                                    ? 'bg-white/5 border-white/10 text-white'
                                                    : 'bg-white border-gray-200 text-gray-900'}`}>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div
                                                            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                                            <Calendar size={20} className="text-white"/>
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Promedio
                                                                mensual</p>
                                                            <p className="text-2xl font-bold">{stats.avgMonthly.toFixed(2)}€</p>
                                                        </div>
                                                    </div>
                                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {stats.trendText}
                                                        {stats.trend !== 0 && (
                                                            <span
                                                                className={`ml-2 ${stats.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {stats.trend >= 0 ? '↗' : '↘'}
                              </span>
                                                        )}
                                                    </p>
                                                </div>

                                                <div className={`p-4 rounded-xl border ${isDarkMode
                                                    ? 'bg-white/5 border-white/10 text-white'
                                                    : 'bg-white border-gray-200 text-gray-900'}`}>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div
                                                            className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                            <BarChart3 size={20} className="text-white"/>
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Mes
                                                                actual</p>
                                                            <p className="text-2xl font-bold">{stats.currentMonth.toFixed(2)}€</p>
                                                        </div>
                                                    </div>
                                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {new Date().toLocaleDateString('es-ES', {month: 'long'})}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Lista de gastos por mes */}
                                    <div className="space-y-4">
                                        {(() => {
                                            const stats = getExpenseStats();
                                            return stats?.filteredExpenses.map((expense) => {
                                                const monthKey = `${expense.year}-${expense.month}`;
                                                const isExpanded = expandedMonths.includes(monthKey);

                                                return (
                                                    <div key={monthKey}
                                                         className={`rounded-xl border overflow-hidden ${isDarkMode
                                                             ? 'bg-white/5 border-white/10'
                                                             : 'bg-white border-gray-200'}`}>

                                                        {/* Encabezado del mes */}
                                                        <button
                                                            onClick={() => toggleExpandMonth(monthKey)}
                                                            className={`w-full p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-white/5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-left">
                                                                    <h3 className="text-lg font-medium">
                                                                        {expense.month} {expense.year}
                                                                    </h3>
                                                                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        {expense.reservations.length} {expense.reservations.length === 1 ? 'reserva' : 'reservas'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-4">
                                                                <div className="text-right">
                                                                    <p className="text-xl font-bold text-green-500">
                                                                        {expense.total.toFixed(2)}€
                                                                    </p>
                                                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        Total gastado
                                                                    </p>
                                                                </div>
                                                                {isExpanded ? <ChevronUp size={20}/> :
                                                                    <ChevronDown size={20}/>}
                                                            </div>
                                                        </button>

                                                        {/* Detalles expandidos */}
                                                        {isExpanded && (
                                                            <div
                                                                className={`px-4 pb-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                                                                {/* Desglose por instalación */}
                                                                <div className="mt-4">
                                                                    <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        Desglose por instalación
                                                                    </h4>
                                                                    <div className="space-y-2">
                                                                        {Object.entries(expense.facilityBreakdown)
                                                                            .sort(([, a], [, b]) => b - a)
                                                                            .map(([facility, amount]) => (
                                                                                <div key={facility}
                                                                                     className="flex items-center justify-between">
                                                                                    <div
                                                                                        className="flex items-center gap-3">
                                                                                        <div
                                                                                            className={`w-3 h-3 rounded-full ${getFacilityColor(facility)}`}></div>
                                                                                        <span
                                                                                            className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                              {facility}
                                            </span>
                                                                                    </div>
                                                                                    <span
                                                                                        className="font-medium">{amount.toFixed(2)}€</span>
                                                                                </div>
                                                                            ))}
                                                                    </div>
                                                                </div>

                                                                {/* Lista de reservas del mes */}
                                                                <div className="mt-4">
                                                                    <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        Reservas del mes
                                                                    </h4>
                                                                    <div
                                                                        className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                                                        {expense.reservations.map((reservation) => (
                                                                            <div key={reservation.id}
                                                                                 className={`p-3 rounded-lg border ${isDarkMode
                                                                                     ? 'bg-white/5 border-white/5'
                                                                                     : 'bg-gray-50 border-gray-100'}`}>
                                                                                <div
                                                                                    className="flex justify-between items-center">
                                                                                    <div>
                                                                                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                                            {reservation.facility}
                                                                                        </p>
                                                                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                                            {new Date(reservation.start_time).toLocaleDateString('es-ES', {
                                                                                                day: 'numeric',
                                                                                                month: 'short',
                                                                                            })}{' '}
                                                                                            • {new Date(reservation.start_time).toLocaleTimeString([], {
                                                                                            hour: '2-digit',
                                                                                            minute: '2-digit'
                                                                                        })}
                                                                                        </p>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <p className="font-bold text-green-500">
                                                                                            {reservation.price.toFixed(2)}€
                                                                                        </p>
                                                                                        <StatusBadge
                                                                                            status={reservation.status}/>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>

                                    {/* Resumen total */}
                                    {(() => {
                                        const stats = getExpenseStats();
                                        if (!stats || stats.filteredExpenses.length === 0) return null;

                                        return (
                                            <div className={`mt-6 p-4 rounded-xl border ${isDarkMode
                                                ? 'bg-gradient-to-r from-purple-900/20 to-purple-800/20 border-purple-500/20'
                                                : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'}`}>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            Resumen total
                                                        </p>
                                                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            Período
                                                            seleccionado: {expenseFilter === 'all' ? 'Todos los meses' :
                                                            expenseFilter === 'currentYear' ? 'Año actual' : 'Últimos 6 meses'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-green-500">
                                                            {stats.totalSpent.toFixed(2)}€
                                                        </p>
                                                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            en {stats.filteredExpenses.length} {stats.filteredExpenses.length === 1 ? 'mes' : 'meses'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL RESERVA - VERSIÓN PREMIUM MEJORADA */}
            {showReserveModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className={`relative max-w-2xl w-full h-[90vh] overflow-hidden rounded-3xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
                        {/* Cabecera con degradado dinámico */}
                        <div className={`bg-gradient-to-r ${facilityColor} p-6 md:p-8 relative overflow-hidden`}>
                            <div className="absolute top-4 right-4">
                                <button onClick={() => setShowReserveModal(false)}
                                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition backdrop-blur-sm text-white">
                                    <X size={20}/>
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between mt-8">
                                <div className="text-white text-center md:text-left">
                                    <div className="text-5xl md:text-6xl mb-4 animate-bounce">
                                        {facilityIcon}
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Reservar {newResFacility}</h2>
                                    <p className="opacity-90">Selecciona fecha y hora para tu reserva</p>
                                </div>

                                <div className="mt-6 md:mt-0 glass p-4 md:p-6 rounded-2xl backdrop-blur-sm bg-white/10 border border-white/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                            <CreditCard className="text-white" size={24}/>
                                        </div>
                                        <div>
                                            <p className="text-white text-sm opacity-90">Precio por reserva</p>
                                            <p className="text-2xl font-bold text-white">
                                                {selectedFacilityInfo?.price || '15.00'}€
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-white/80 text-sm">
                                        <Shield size={14}/>
                                        <span>Pago 100% seguro • Cancelación gratuita</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contenido del formulario - Diseño tipo tarjeta */}
                        <div className="p-6 md:p-8 overflow-y-auto h-[calc(100%-200px)]">
                            <div className="space-y-6">
                                {/* Instalación */}
                                <div className={`glass p-4 md:p-6 rounded-2xl border ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-blue-500/10">
                                                <Calendar className="text-blue-400" size={16}/>
                                            </div>
                                            <span>Instalación</span>
                                        </div>
                                    </label>
                                    <select
                                        value={newResFacility}
                                        onChange={e => setNewResFacility(e.target.value)}
                                        className={`w-full border rounded-xl px-4 py-3 text-lg font-medium transition-all ${isDarkMode 
                                            ? 'bg-black/40 border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'}`}
                                    >
                                        {Object.values(facilitiesConfig).map((facility, idx) => (
                                            <option key={idx} value={facility.name}>
                                                {facility.name} • {facility.price}€ • Capacidad: {facility.capacity}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fecha */}
                                <div className={`glass p-4 md:p-6 rounded-2xl border ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-green-500/10">
                                                <Calendar className="text-green-400" size={16}/>
                                            </div>
                                            <span>Fecha de reserva</span>
                                        </div>
                                    </label>
                                    <input
                                        type="date"
                                        value={newResDate}
                                        min={getMinDate()}
                                        onChange={e => setNewResDate(e.target.value)}
                                        className={`w-full border rounded-xl px-4 py-3 text-lg font-medium transition-all ${isDarkMode 
                                            ? 'bg-black/40 border-white/10 text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 scheme-dark' 
                                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 scheme-light'}`}
                                    />
                                </div>

                                {/* Selector de horas - Diseño mejorado */}
                                <div className={`glass p-4 md:p-6 rounded-2xl border ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-purple-500/10">
                                                <Clock className="text-purple-400" size={16}/>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    Horarios disponibles
                                                </label>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Se actualizan en tiempo real
                                                </p>
                                            </div>
                                        </div>
                                        {loadingSlots && (
                                            <div className="flex items-center gap-2 text-sm text-purple-400">
                                                <Loader2 size={14} className="animate-spin"/>
                                                Actualizando...
                                            </div>
                                        )}
                                    </div>

                                    {loadingSlots ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="animate-spin text-purple-500" size={32}/>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {TIME_SLOTS.map((slot) => {
                                                const slotInfo = slotAvailability[slot];
                                                const currentCapacity = slotInfo?.capacity || selectedFacilityInfo?.capacity || 1;
                                                const currentCount = slotInfo?.count || 0;
                                                const isFull = currentCount >= currentCapacity;
                                                const available = currentCapacity - currentCount;
                                                const isSelected = selectedTimeSlot === slot;
                                                const userAlreadyBooked = userAlreadyHasReservation(slot);

                                                return (
                                                    <button
                                                        key={slot}
                                                        disabled={isFull || userAlreadyBooked}
                                                        onClick={() => setSelectedTimeSlot(slot)}
                                                        className={`
                                                            relative p-4 rounded-xl border-2 transition-all duration-300
                                                            flex flex-col items-center justify-center gap-2
                                                            ${isFull || userAlreadyBooked
                                                                ? 'border-red-300 bg-red-50/50 text-red-400 cursor-not-allowed'
                                                                : isSelected
                                                                    ? `${isDarkMode 
                                                                        ? 'border-blue-500 bg-blue-500/20 text-white' 
                                                                        : 'border-blue-500 bg-blue-50 text-blue-700'} shadow-lg scale-105`
                                                                    : `${isDarkMode 
                                                                        ? 'border-white/10 hover:border-blue-400/50 bg-white/5 hover:bg-blue-500/10 text-white' 
                                                                        : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 text-gray-700'}`
                                                            }
                                                        `}
                                                    >
                                                        <span className="text-lg font-bold">{slot}</span>

                                                        <div className="flex items-center gap-1">
                                                            <div className={`w-2 h-2 rounded-full ${isFull ? 'bg-red-500' : available > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                            <span className="text-xs font-medium">
                                                                {userAlreadyBooked
                                                                    ? 'Tu reserva'
                                                                    : isFull
                                                                        ? 'Completo'
                                                                        : `${available} libre${available !== 1 ? 's' : ''}`}
                                                            </span>
                                                        </div>

                                                        {userAlreadyBooked && (
                                                            <div className="absolute -top-2 -right-2">
                                                                <div className="bg-purple-500 text-white text-[10px] px-2 py-1 rounded-full">
                                                                    TÚ
                                                                </div>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Botones de acción */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setShowReserveModal(false)}
                                        className={`flex-1 py-4 rounded-xl font-medium transition ${isDarkMode 
                                            ? 'bg-white/10 hover:bg-white/20 text-white' 
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        onClick={handleCreateReservation}
                                        disabled={!selectedTimeSlot ||
                                            (slotAvailability[selectedTimeSlot || '']?.count || 0) >=
                                            (slotAvailability[selectedTimeSlot || '']?.capacity || selectedFacilityInfo?.capacity || 1) ||
                                            userAlreadyHasReservation(selectedTimeSlot)}
                                        className={`flex-1 py-4 rounded-xl font-bold transition flex items-center justify-center gap-3
                                            ${!selectedTimeSlot || 
                                                (slotAvailability[selectedTimeSlot || '']?.count || 0) >= 
                                                (slotAvailability[selectedTimeSlot || '']?.capacity || selectedFacilityInfo?.capacity || 1) ||
                                                userAlreadyHasReservation(selectedTimeSlot)
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : `bg-gradient-to-r ${facilityColor} text-white hover:opacity-90`
                                            }`}
                                    >
                                        <CreditCard size={20}/>
                                        <span>Continuar al Pago</span>
                                        <span className="ml-2 opacity-90">
                                            ({selectedFacilityInfo?.price || '15.00'}€)
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL COMPLETAR PERFIL */}
            {showCompleteProfile && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60] p-4 md:p-6">
                    <div
                        className={`glass p-4 md:p-8 rounded-2xl max-w-md w-full border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.15)] animate-in fade-in zoom-in duration-300 ${isDarkMode ? '' : 'bg-white'}`}>
                        <div className="text-center mb-6">
                            <div
                                className="w-12 h-12 md:w-16 md:h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                                <User size={24} className="text-purple-400"/>
                            </div>
                            <h2 className={`text-xl md:text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Completa
                                tu perfil</h2>
                            <div
                                className="flex items-center gap-2 justify-center mt-3 text-amber-300 bg-amber-900/20 py-2 px-3 rounded-lg border border-amber-500/20">
                                <AlertCircle size={14}/>
                                <p className="text-xs font-medium">Requerido para acceder a las reservas</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4 md:space-y-5">
                            <div>
                                <label
                                    className="text-xs text-gray-400 uppercase tracking-wider ml-1 font-semibold">Teléfono
                                    móvil</label>
                                <input
                                    required
                                    type="tel"
                                    value={profileForm.phone}
                                    onChange={handlePhoneChange}
                                    className={`w-full border rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition placeholder-gray-500 ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                    placeholder="Ej: 600123456"
                                    maxLength={9}
                                />
                                <p className="text-xs text-gray-500 mt-1">Debe empezar por 6 y tener 9 dígitos</p>
                            </div>

                            <div className="relative" ref={wrapperRef}>
                                <label
                                    className="text-xs text-gray-400 uppercase tracking-wider ml-1 font-semibold">Dirección</label>
                                <div className="relative mt-1">
                                    <MapPin size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                                    <input required type="text" value={profileForm.address}
                                           onChange={e => {
                                               setProfileForm({
                                                   ...profileForm,
                                                   address: e.target.value
                                               });
                                               setShowAddressMenu(true);
                                           }}
                                           className={`w-full border rounded-xl pl-10 pr-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition placeholder-gray-500 ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                           placeholder="Empieza a escribir tu calle..."
                                           autoComplete="off"/>
                                </div>
                                {addressSuggestions.length > 0 && showAddressMenu && (
                                    <ul className={`absolute z-50 w-full mt-1 border rounded-xl shadow-2xl max-h-48 overflow-y-auto ${isDarkMode ? 'bg-gray-900 border-white/10 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}>
                                        {addressSuggestions.map((item, idx) => (
                                            <li key={idx} onClick={() => handleSelectAddress(item)}
                                                className={`px-4 py-3 cursor-pointer border-b last:border-0 transition-colors ${isDarkMode ? 'hover:bg-purple-900/30 border-white/5 hover:text-white' : 'hover:bg-gray-100 border-gray-100 hover:text-gray-900'}`}>
                                                {item.properties.street || item.properties.name} {item.properties.housenumber}, {item.properties.city}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        className="text-xs text-gray-400 uppercase tracking-wider ml-1 font-semibold">Apartamento</label>
                                    <input
                                        required
                                        type="text"
                                        value={profileForm.apartment}
                                        onChange={handleApartmentChange}
                                        className={`w-full border rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition uppercase placeholder-gray-500 ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                        placeholder="Ej: 4B"
                                        maxLength={3}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Máx 2 números + 1 letra</p>
                                </div>
                                <div>
                                    <label
                                        className="text-xs text-gray-400 uppercase tracking-wider ml-1 font-semibold">C.
                                        Postal</label>
                                    <input
                                        required
                                        type="text"
                                        value={profileForm.postal_code}
                                        onChange={handlePostalCodeChange}
                                        className={`w-full border rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition placeholder-gray-500 ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                        placeholder="28000"
                                        maxLength={5}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">5 dígitos</p>
                                </div>
                            </div>

                            <button type="submit" disabled={updatingProfile}
                                    className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 hover:from-purple-700 hover:via-purple-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer shadow-2xl shadow-purple-900/40 animate-pulse animate-infinite">
                                {updatingProfile ? <Loader2 className="animate-spin"/> : <><Save
                                    size={20}/> CONFIRMAR Y GUARDAR</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL CONFIRMAR BORRAR RESERVA */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4 md:p-6">
                    <div
                        className={`glass p-6 md:p-8 rounded-2xl max-w-md w-full border-red-500/30 ${isDarkMode ? '' : 'bg-white'}`}>
                        <div className="text-center mb-6">
                            <div
                                className="w-12 h-12 md:w-16 md:h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                                <Trash2 size={24} className="text-red-400"/>
                            </div>
                            <h2 className={`text-xl md:text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>¿Eliminar
                                Reserva?</h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Esta acción no se
                                puede deshacer.</p>
                        </div>

                        <div className="flex gap-3 md:gap-4">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setReservationToDelete(null);
                                }}
                                className={`flex-1 py-2 md:py-3 rounded-lg transition cursor-pointer border-none ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => reservationToDelete && handleDeleteReservation(reservationToDelete)}
                                disabled={deletingReservation}
                                className="flex-1 py-2 md:py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition cursor-pointer border-none disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deletingReservation ?
                                    <Loader2 className="animate-spin" size={16}/> : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}