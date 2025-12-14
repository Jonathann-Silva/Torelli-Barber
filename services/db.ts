import { db } from "../firebaseConfig";
import { Service, Appointment, UserRole } from "../types";
import { SERVICES as DEFAULT_SERVICES } from "../constants";

// --- Services Management ---
export const getServices = async (): Promise<Service[]> => {
  const querySnapshot = await db.collection("services").get();
  if (querySnapshot.empty) {
    // Se não houver serviços, cria os padrões (Seed)
    const batchPromises = DEFAULT_SERVICES.map(s => 
      db.collection("services").doc(s.id).set(s)
    );
    await Promise.all(batchPromises);
    return DEFAULT_SERVICES;
  }
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
};

export const saveService = async (service: Service) => {
  const serviceRef = db.collection("services").doc(service.id);
  await serviceRef.set(service, { merge: true });
};

export const deleteService = async (serviceId: string) => {
  await db.collection("services").doc(serviceId).delete();
};

// --- Settings Management ---
export const getShopSettings = async () => {
  const docRef = db.collection("settings").doc("shop");
  const docSnap = await docRef.get();
  if (docSnap.exists) return docSnap.data();
  
  // Default Settings
  const defaultSettings = {
    open: '09:00',
    close: '19:00',
    lunchStart: '12:00',
    lunchEnd: '13:00'
  };
  await docRef.set(defaultSettings);
  return defaultSettings;
};

export const saveShopSettings = async (settings: any) => {
  await db.collection("settings").doc("shop").set(settings);
};

// --- Appointments ---
export const createAppointment = async (appointmentData: Partial<Appointment>) => {
  // Adiciona coleção 'appointments'
  const docRef = await db.collection("appointments").add(appointmentData);
  return docRef.id;
};

export const getAppointments = async (userId: string, role: UserRole) => {
  const appointmentsRef = db.collection("appointments");
  let querySnapshot;
  
  if (role === UserRole.CLIENT) {
    querySnapshot = await appointmentsRef.where("clientId", "==", userId).get();
  } else {
    // Admin vê tudo
    querySnapshot = await appointmentsRef.get();
  }

  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
};

export const updateAppointmentStatus = async (id: string, status: string) => {
  const apptRef = db.collection("appointments").doc(id);
  await apptRef.update({ status });
};