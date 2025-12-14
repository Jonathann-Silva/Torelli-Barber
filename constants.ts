import { Service, Barber, Appointment, AppointmentStatus, User, UserRole } from './types';

export const SERVICES: Service[] = [
  {
    id: '1',
    name: 'Corte de Cabelo',
    description: 'Corte clássico ou moderno com tesoura e máquina. Inclui lavagem.',
    price: 50.00,
    duration: 45,
    icon: 'content_cut'
  },
  {
    id: '2',
    name: 'Barba e Bigode',
    description: 'Modelagem completa com toalha quente e balm hidratante.',
    price: 35.00,
    duration: 30,
    icon: 'face'
  },
  {
    id: '3',
    name: 'Combo Completo',
    description: 'Corte de cabelo + Barba + Sobrancelha. O tratamento VIP.',
    price: 75.00,
    duration: 75,
    icon: 'diamond'
  },
  {
    id: '4',
    name: 'Pezinho / Acabamento',
    description: 'Apenas o contorno e limpeza dos pelos do pescoço.',
    price: 15.00,
    duration: 15,
    icon: 'straighten'
  }
];

export const BARBERS: Barber[] = [
  {
    id: '1',
    name: 'Carlos "The Fade"',
    rating: 4.9,
    reviews: 124,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRZI3OXtApu6QkAtMqSIi0p2SzMWhQ1Kqj_5xI4sRyvTyEH4sHDg-GSC7aumqsrcDYQOM-2VP1Bz8efSfyTOrEs0WCiIu_weZzSUW_eycAigZmi1FJUn_U5Sc62oWv7b1Kqx42xb4wsolc1-4MVkZZF85nTNzujxTgfdxtOFsMegnMUE_jjiW-CY1_qKFQ21t-sQUo-6RtemLiiNgueuLHP8QNTfZCa54z7xp70ehABWQRsxxRxBFldHup4bMRGklK0sUCcEf6V3U_',
    specialty: 'Fade Master'
  },
  {
    id: '2',
    name: 'André Santos',
    rating: 4.8,
    reviews: 98,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBW4wXFj-Mw1EiM2D4etvQ6S9BljQcayfooNbjiO_wl6kRC6QKKSdv8RvRLY6YqKnkloak2HoHyohWu8gx7BzVvZ7Zq37XCvxHa2Xa0W-UZfO-XtYM7p89jq0Y-0rdZ1tiKXR6XfawShxOBE-n7K7NG6laS_I65T9-Oq4vmttMI5uo4uiv-IiIFLrp2V73MTU98qcsz6v1fEB5PiMsRuH9FaROS1nL_JM40kwT3rIMRSLwpMiU7m2otihNkll7x_pOh01pMioylUeQe',
    specialty: 'Classic Cuts'
  },
  {
    id: '3',
    name: 'João Silva',
    rating: 5.0,
    reviews: 210,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5ZzU06Pi66yGtW6jUpD1GnwLtOBX174DaCihNEsKiSO7OURhD9a-0zE7MCeXbLkjv6NL4bC_pUCjNxSNCoSiGWGP03qGBmiRUC7x6uMdNYrjaF4cgk5_6-WRRzIcpet7pl35gAJg9QYRkUFip_P6DCad40Ppbl8eJdFRb-SOAgPyBoxwAZ0kyGa4WQQp-Yax31prrJ5hAGkCmTjmfOwPx8p8CsWf-_gTm0YwqoL4Tp3eWtzhSxmVBPXZP3YlHZrh6r291ufwQZ4_e',
    specialty: 'Beard Expert'
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '101',
    clientId: 'c1',
    clientName: 'Carlos Eduardo',
    barberId: '3',
    barberName: 'João Silva',
    serviceId: '1',
    serviceName: 'Corte + Barba',
    date: '2023-10-24',
    time: '09:00',
    status: AppointmentStatus.COMPLETED,
    price: 85.00,
    clientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0Kq7OCcTeI3WJcYW0Z1jqZQN5qCaznuQslKGwEYzc3QqEiPvq1zTeq0qLLJsxhtZqOnbRZ0EiyaFJT6vWwLAv12q_Oz9u6ZVuFL16xP542arzhJUF5JzHPxXS-oemGxnwQf4-cFQvT674h8kuecoZMIWI-JOVT0ICpvn1425qB8BuaM6j8XAkfm4Op8RcvFCwK7raJIRgaBhAX15YaehXpPLU1fRz-BXUdzIRZDAFb02DGEiAayD99tbHzBh5kTx4OgmWsJDZseWk',
    barberAvatar: BARBERS[2].image
  },
  {
    id: '102',
    clientId: 'c2',
    clientName: 'Pedro Costa',
    barberId: '3',
    barberName: 'João Silva',
    serviceId: '2',
    serviceName: 'Barba Terapia',
    date: '2023-10-24',
    time: '11:30',
    status: AppointmentStatus.CONFIRMED,
    price: 45.00,
    clientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoPTjR_vbcdwXogp53q2lVpUUxrRen9EzqVp7zckYB_eXOqOLJN5cD4k71Pz9LiJ-RHnxR0oskaEhavOo4FwgZ4SP_UAiwZuYPNwK9yxzN22NwbzilSrEoFcR7oAQpxtZYu75AZgWsQ4-dfxhNQS2VvGiJe3J-I1vo9S9D5gKkQkPlalCd4d-AHnIGPB4CUxfsB2Xnn_H-GVkhcwx3HD8DMFNKYYLF99MckVJGsRjImGtsZWm4ryGPXPmLjIUevXUYEFOuOEnBPSof',
    barberAvatar: BARBERS[2].image
  },
  {
    id: '103',
    clientId: 'c3',
    clientName: 'Lucas Mendes',
    barberId: '3',
    barberName: 'João Silva',
    serviceId: '1',
    serviceName: 'Corte Infantil',
    date: '2023-10-24',
    time: '14:00',
    status: AppointmentStatus.PENDING,
    price: 40.00,
    clientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVRdvjRsJb8piMATxaQFClR1lOQYA16DmekPmiHmaGu9idZH3NWPJyTm96rsX9_F1Ga-WhhUoAQQLBXKxvrsjj4ShU3tABKOgA6rOLuLV0oa7zDYdMUVoBVCpMkiEadvR0penm1XWY4Tr9sOpM20OnDLXBX3vVUl8hHTax-LeZ1kFkDkKxoBw3NEAXhdAu9DaMYxUwTTC8pbo0gQIZuChkJXzFdqFyFQkCy6LipINuxQ3oOlMSBI8ALjQaN62GwlOLivAABFT-Q5hE',
    barberAvatar: BARBERS[2].image
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'admin1',
    name: 'Marcos Silva',
    email: 'admin@barber.com',
    role: UserRole.ADMIN,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgGiUilMZJ7P5fP_swTaOuviISYzAgEkExcVzSUUX5iouIL1Lrp7C4yxB_cj-0GDeKKxSAaaukZZ-qPA4ScgU0m-vNzFXN0zuVHpzFGFSNLrCcm7-4lALIWGgZ2kpt7rK4AFVkRvW7_tmXM_3Y_O1T_qxk5PanqYp2Nk13JR2Yo6u6_S7pQIOMRw2QmQAYCz9GON0mbp5xXw284QdR4pFJhgXVsdDDL5dmIUYu2-lL5z0dN4cfTkOm6CiwSAc51yZjJ2CX6iu6UmBF',
    emailVerified: true
  },
  {
    id: 'client1',
    name: 'Gustavo Silva',
    email: 'client@barber.com',
    role: UserRole.CLIENT,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA7nJNXjrrTEAF3xRDRszktRWrojLI9hr8uWpwgB-hun5Am9EEpIq8IBQMxNQeykPCMtuhOW2brZ3GW-CWlNT7l573pEWyOIW264TzsX9M6lYG2G9ojxC36JqQMg7OKddSMZf1g2vAUB66I5aS0QB_BnEPcvEDrQjw8PcGX7sPLEUE7HH1t0Vgv2q8Ty9xHr5-10j33WcvYqe8MLVP2wlgUVwpslqZPo2sSouILgRATMmt6wxUsAfbJHRu4UEwhMFo1TPEGepyBu6V',
    emailVerified: true
  }
];