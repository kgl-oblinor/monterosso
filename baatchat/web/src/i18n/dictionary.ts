// Hand-rolled, typed i18n dictionary for the web-app shell (dashboard + auth).
//
// Three locales, keyed by stable dot-keys. `en` is the default/fallback (international
// travellers), `it` is for skippers (Andrea), `nb` mirrors the CURRENT Norwegian copy.
// The IT strings are machine-produced and should be reviewed by a native speaker/Andrea.
//
// Simple `{name}` interpolation is applied by useT()/translate() — the strings just carry
// the placeholders. Add a key here, then wire it in a component with t('the.key').

export const LOCALES = ["en", "it", "nb"] as const;
export type Locale = (typeof LOCALES)[number];

/** Fallback locale when a role has none / a string is missing for the active locale. */
export const DEFAULT_LOCALE: Locale = "en";

/** One string per locale. */
type Entry = Record<Locale, string>;

// `satisfies` keeps each entry complete (all three locales) while letting us derive the
// exact key union below.
export const dictionary = {
  // --- common (shared across sections) --------------------------------------
  "common.loading": { en: "Loading …", it: "Caricamento …", nb: "Laster …" },
  "common.save": { en: "Save changes", it: "Salva modifiche", nb: "Lagre endringer" },
  "common.saving": { en: "Saving …", it: "Salvataggio …", nb: "Lagrer …" },
  "common.saved": { en: "Saved.", it: "Salvato.", nb: "Lagret." },

  // --- nav / icon rail ------------------------------------------------------
  "nav.home": { en: "Home", it: "Home", nb: "Hjem" },
  "nav.chat": { en: "Chat", it: "Chat", nb: "Chat" },
  "nav.trips": { en: "Trips", it: "Viaggi", nb: "Turer" },
  "nav.departures": { en: "My departures", it: "Le mie partenze", nb: "Mine avganger" },
  "nav.customers": { en: "Customers", it: "Clienti", nb: "Kunder" },
  "nav.site": { en: "My page", it: "La mia pagina", nb: "Min side" },
  "nav.profile": { en: "Profile", it: "Profilo", nb: "Profil" },
  "nav.openMenu": { en: "Open menu", it: "Apri menu", nb: "Åpne sidemeny" },
  "nav.closeMenu": { en: "Close menu", it: "Chiudi menu", nb: "Lukk sidemeny" },
  "nav.closeDrawer": { en: "Close menu", it: "Chiudi menu", nb: "Lukk meny" },
  "nav.hideMenu": { en: "Hide menu", it: "Nascondi menu", nb: "Skjul meny" },

  // --- get the app (PWA install) --------------------------------------------
  "getapp.link": { en: "Get the app", it: "Scarica l'app", nb: "Hent appen" },
  "getapp.title": { en: "Get the app", it: "Scarica l'app", nb: "Hent appen" },
  "getapp.subtitle": {
    en: "Add Monterosso to your home screen for a calm, full-screen experience.",
    it: "Aggiungi Monterosso alla schermata Home per un'esperienza a schermo intero.",
    nb: "Legg Monterosso på hjemskjermen for en rolig fullskjermsopplevelse.",
  },
  "getapp.install": { en: "Install", it: "Installa", nb: "Installer" },
  "getapp.installed": {
    en: "Monterosso is installed. Open it from your home screen.",
    it: "Monterosso è installata. Aprila dalla schermata Home.",
    nb: "Monterosso er installert. Åpne den fra hjemskjermen.",
  },
  "getapp.iosTitle": { en: "Add to Home Screen", it: "Aggiungi a Home", nb: "Legg til på Hjem" },
  "getapp.iosStep1": {
    en: "Tap the Share button in Safari.",
    it: "Tocca il pulsante Condividi in Safari.",
    nb: "Trykk på Del-knappen i Safari.",
  },
  "getapp.iosStep2": {
    en: "Choose “Add to Home Screen”.",
    it: "Scegli “Aggiungi a Home”.",
    nb: "Velg «Legg til på Hjem-skjerm».",
  },
  "getapp.desktopHint": {
    en: "Open this page on your phone, or use your browser's install option in the address bar.",
    it: "Apri questa pagina sul telefono, o usa l'opzione di installazione del browser.",
    nb: "Åpne denne siden på mobilen, eller bruk nettleserens installer-valg i adressefeltet.",
  },
  "getapp.storesNote": {
    en: "Native apps are on the way.",
    it: "Le app native sono in arrivo.",
    nb: "Native apper er på vei.",
  },
  "getapp.comingSoon": { en: "Coming soon", it: "In arrivo", nb: "Kommer snart" },
  "getapp.appStore": { en: "App Store", it: "App Store", nb: "App Store" },
  "getapp.googlePlay": { en: "Google Play", it: "Google Play", nb: "Google Play" },
  "getapp.close": { en: "Close", it: "Chiudi", nb: "Lukk" },

  // --- home overview --------------------------------------------------------
  "home.welcome": { en: "Welcome aboard", it: "Benvenuto a bordo", nb: "Velkommen ombord" },
  "home.greeting": { en: "Good day, {name}.", it: "Buongiorno, {name}.", nb: "God dag, {name}." },
  "home.friend": { en: "friend", it: "amico", nb: "venn" },
  "home.subtitle.skipper": {
    en: "A calm overview of your departures and conversations. The sea awaits.",
    it: "Una panoramica tranquilla delle tue partenze e conversazioni. Il mare ti aspetta.",
    nb: "Rolig oversikt over avgangene og samtalene dine. Sjøen venter.",
  },
  "home.subtitle.customer": {
    en: "A quiet moment before your trip. Here's everything that matters, in one place.",
    it: "Un momento di calma prima del viaggio. Qui trovi tutto ciò che conta, in un solo posto.",
    nb: "Et stille øyeblikk før turen. Her finner du det viktigste samlet.",
  },
  "home.nextTrip.skipper": { en: "Next departure", it: "Prossima partenza", nb: "Neste avgang" },
  "home.nextTrip.customer": { en: "Next trip", it: "Prossimo viaggio", nb: "Neste tur" },
  "home.nextTrip.emptySkipper": {
    en: "No upcoming departures yet. When someone books, it'll appear here.",
    it: "Nessuna partenza in programma. Quando qualcuno prenota, apparirà qui.",
    nb: "Ingen kommende avganger ennå. Når noen bestiller, dukker den opp her.",
  },
  "home.nextTrip.emptyCustomer": {
    en: "No upcoming trips yet. When a reservation is linked to your account, you'll see it here.",
    it: "Nessun viaggio in programma. Quando una prenotazione verrà collegata al tuo account, la vedrai qui.",
    nb: "Ingen kommende turer ennå. Når en reservasjon kobles til kontoen din, ser du den her.",
  },
  "home.shortcuts": { en: "Shortcuts", it: "Scorciatoie", nb: "Snarveier" },
  "home.tile.chat.label": {
    en: "Talk to the skipper",
    it: "Parla con lo skipper",
    nb: "Snakk med skipperen",
  },
  "home.tile.chat.hint": {
    en: "Ask, arrange a time, book",
    it: "Chiedi, concorda un orario, prenota",
    nb: "Spør, avtal tid, bestill",
  },
  "home.tile.trips.label": { en: "My trip", it: "Il mio viaggio", nb: "Turen min" },
  "home.tile.trips.hint": {
    en: "Date, place and code",
    it: "Data, luogo e codice",
    nb: "Dato, sted og kode",
  },
  "home.tile.support.label": {
    en: "Customer service",
    it: "Assistenza clienti",
    nb: "Kundeservice",
  },
  "home.tile.support.hint": {
    en: "Call or write – we'll answer",
    it: "Chiama o scrivi – ti rispondiamo",
    nb: "Ring eller skriv – vi svarer",
  },
  "home.tile.profile.label": { en: "My profile", it: "Il mio profilo", nb: "Min profil" },
  "home.tile.profile.hint": {
    en: "Name, email and phone",
    it: "Nome, email e telefono",
    nb: "Navn, e-post og telefon",
  },
  "home.tile.book.label": {
    en: "Book another trip",
    it: "Prenota un altro viaggio",
    nb: "Book en ny tur",
  },
  "home.tile.book.hint": {
    en: "See departures on our site",
    it: "Vedi le partenze sul nostro sito",
    nb: "Se avganger på nettsiden vår",
  },

  // --- trips ("Turer" / "Mine avganger") ------------------------------------
  "trips.title": { en: "Trips", it: "Viaggi", nb: "Turer" },
  "trips.titleSkipper": { en: "My departures", it: "Le mie partenze", nb: "Mine avganger" },
  "trips.contactLabel.skipper": { en: "Guest", it: "Ospite", nb: "Gjest" },
  "trips.contactLabel.customer": { en: "Skipper", it: "Skipper", nb: "Skipper" },
  "trips.loadError": {
    en: "Couldn't load your trips.",
    it: "Impossibile caricare i tuoi viaggi.",
    nb: "Kunne ikke laste turene.",
  },
  "trips.emptyTitle": { en: "No trips yet", it: "Ancora nessun viaggio", nb: "Ingen turer ennå" },
  "trips.emptyHintSkipper": {
    en: "When someone books one of your departures, it'll show up here – along with who's aboard.",
    it: "Quando qualcuno prenota una delle tue partenze, apparirà qui – con chi è a bordo.",
    nb: "Når noen bestiller en av avgangene dine, dukker den opp her – med hvem som er ombord.",
  },
  "trips.emptyHintCustomer": {
    en: "When a reservation is linked to your account, you'll see it here – with the skipper, date and status.",
    it: "Quando una prenotazione verrà collegata al tuo account, la vedrai qui – con lo skipper, la data e lo stato.",
    nb: "Når en reservasjon kobles til kontoen din, ser du den her – med skipper, dato og status.",
  },
  "trips.invite": {
    en: "Invite your travel party",
    it: "Invita i tuoi compagni di viaggio",
    nb: "Inviter reisefølget",
  },
  "trips.guests": { en: "{count} guests", it: "{count} ospiti", nb: "{count} gjester" },
  "trips.status.requested": { en: "New request", it: "Nuova richiesta", nb: "Ny forespørsel" },
  "trips.status.booked": { en: "Confirmed", it: "Confermato", nb: "Bekreftet" },
  "trips.status.completed": { en: "Completed", it: "Completato", nb: "Fullført" },
  "trips.status.cancelled": { en: "Cancelled", it: "Annullato", nb: "Avlyst" },
  "trips.confirm": { en: "Confirm", it: "Conferma", nb: "Bekreft" },
  "trips.decline": { en: "Decline", it: "Rifiuta", nb: "Avslå" },

  // --- profile --------------------------------------------------------------
  "profile.title": { en: "Profile", it: "Profilo", nb: "Profil" },
  "profile.loadError": {
    en: "Couldn't load your profile.",
    it: "Impossibile caricare il profilo.",
    nb: "Kunne ikke laste profilen.",
  },
  "profile.intro": {
    en: "Your details. Add or update them and save — so the skipper can reach you easily.",
    it: "I tuoi dati. Aggiungi o modifica e salva — così lo skipper ti raggiunge facilmente.",
    nb: "Detaljene dine. Legg til eller endre, og lagre — så når skipperen deg lett.",
  },
  "profile.field.name": { en: "Name", it: "Nome", nb: "Navn" },
  "profile.field.namePlaceholder": { en: "Your name", it: "Il tuo nome", nb: "Navnet ditt" },
  "profile.field.email": { en: "Email", it: "Email", nb: "E-post" },
  "profile.field.emailPlaceholder": {
    en: "name@example.com",
    it: "nome@esempio.com",
    nb: "navn@eksempel.no",
  },
  "profile.field.phone": { en: "Phone / WhatsApp", it: "Telefono / WhatsApp", nb: "Telefon / WhatsApp" },
  "profile.field.phonePlaceholder": { en: "+47 …", it: "+39 …", nb: "+47 …" },
  "profile.logout": { en: "Log out", it: "Esci", nb: "Logg ut" },

  // --- site ("Min side": skipper landing-page editor) -----------------------
  "site.title": { en: "My page", it: "La mia pagina", nb: "Min side" },
  "site.loadError": {
    en: "Couldn't load the settings.",
    it: "Impossibile caricare le impostazioni.",
    nb: "Kunne ikke laste innstillingene.",
  },
  "site.intro": {
    en: "This is your control panel. What you change here shapes your public landing page.",
    it: "Questo è il tuo pannello di controllo. Ciò che modifichi qui plasma la tua pagina pubblica.",
    nb: "Dette er kontrollpanelet ditt. Det du endrer her, styrer den offentlige landingssiden.",
  },
  "site.group.offer": { en: "Offering", it: "Offerta", nb: "Tilbud" },
  "site.field.title": { en: "Title", it: "Titolo", nb: "Tittel" },
  "site.field.titlePlaceholder": { en: "Boat · place", it: "Barca · luogo", nb: "Båt · sted" },
  "site.field.subtitle": { en: "Subtitle", it: "Sottotitolo", nb: "Undertittel" },
  "site.field.subtitlePlaceholder": {
    en: "A short, warm line",
    it: "Una riga breve e calorosa",
    nb: "En kort, varm linje",
  },
  "site.group.pricing": { en: "Price & guests", it: "Prezzo e ospiti", nb: "Pris & gjester" },
  "site.field.pricePerGuest": { en: "Price per guest", it: "Prezzo per ospite", nb: "Pris per gjest" },
  "site.field.maxGuests": { en: "Max guests", it: "Ospiti max", nb: "Maks gjester" },
  "site.group.times": { en: "Times", it: "Orari", nb: "Tider" },
  "site.departure.namePlaceholder": { en: "Name", it: "Nome", nb: "Navn" },
  "site.departure.remove": { en: "Remove departure", it: "Rimuovi partenza", nb: "Fjern avgang" },
  "site.departure.add": { en: "Add departure", it: "Aggiungi partenza", nb: "Legg til avgang" },
  "site.departure.new": { en: "New departure", it: "Nuova partenza", nb: "Ny avgang" },
  "site.group.appearance": { en: "Appearance", it: "Aspetto", nb: "Utseende" },
  "site.appearance.theme": { en: "Theme", it: "Tema", nb: "Tema" },
  "site.appearance.mode": { en: "Day & night", it: "Giorno e notte", nb: "Dag og natt" },
  "site.mode.day": { en: "Always day", it: "Sempre giorno", nb: "Alltid dag" },
  "site.mode.night": { en: "Always night", it: "Sempre notte", nb: "Alltid natt" },
  "site.mode.auto": { en: "Auto", it: "Auto", nb: "Auto" },
  "site.theme.linen": { en: "Linen", it: "Lino", nb: "Lin" },
  "site.theme.sand": { en: "Sand", it: "Sabbia", nb: "Sand" },
  "site.theme.deepsea": { en: "Deep sea", it: "Mare profondo", nb: "Dyp sjø" },
  "site.theme.goldenhour": { en: "Golden hour", it: "Ora dorata", nb: "Gylden time" },
  "site.theme.terracotta": { en: "Terracotta", it: "Terracotta", nb: "Terrakotta" },
  "site.theme.slate": { en: "Slate", it: "Ardesia", nb: "Skifer" },
  "site.theme.riviera": { en: "Riviera", it: "Riviera", nb: "Riviera" },
  "site.theme.coral": { en: "Coral", it: "Corallo", nb: "Korall" },
  "site.theme.editorial": { en: "Editorial", it: "Editoriale", nb: "Redaksjonell" },
  "site.theme.notte": { en: "Night", it: "Notte", nb: "Natt" },
  "site.group.blog": { en: "Blog", it: "Blog", nb: "Blogg" },
  "site.blog.empty": { en: "No posts yet.", it: "Ancora nessun articolo.", nb: "Ingen innlegg ennå." },
  "site.blog.published": { en: "Published", it: "Pubblicato", nb: "Publisert" },
  "site.blog.hidden": { en: "Hidden", it: "Nascosto", nb: "Skjult" },
  "site.blog.delete": { en: "Delete post", it: "Elimina articolo", nb: "Slett innlegg" },
  "site.blog.newTitlePlaceholder": {
    en: "New post title",
    it: "Titolo del nuovo articolo",
    nb: "Tittel på nytt innlegg",
  },
  "site.blog.newBodyPlaceholder": { en: "Write a little …", it: "Scrivi qualcosa …", nb: "Skriv litt …" },
  "site.blog.adding": { en: "Adding …", it: "Aggiunta …", nb: "Legger til …" },
  "site.blog.addPost": { en: "New post", it: "Nuovo articolo", nb: "Nytt innlegg" },

  // --- chat (conversations list + shell) ------------------------------------
  "chat.contacts.skippers": { en: "Skippers", it: "Skipper", nb: "Skippere" },
  "chat.contacts.customers": { en: "Customers", it: "Clienti", nb: "Kunder" },
  "chat.contacts.default": { en: "Contacts", it: "Contatti", nb: "Kontakter" },
  "chat.loadError": {
    en: "Couldn't load conversations.",
    it: "Impossibile caricare le conversazioni.",
    nb: "Kunne ikke laste samtaler.",
  },
  "chat.selectPrompt": {
    en: "Select a conversation to get started.",
    it: "Seleziona una conversazione per iniziare.",
    nb: "Velg en samtale for å komme i gang.",
  },
  "chat.noContacts": {
    en: "You have no one to chat with yet.",
    it: "Non hai ancora nessuno con cui chattare.",
    nb: "Du har ingen kontakter å chatte med ennå.",
  },
  "chat.role.skipper": { en: "Skipper", it: "Skipper", nb: "Skipper" },
  "chat.role.customer": { en: "Customer", it: "Cliente", nb: "Kunde" },
  "chat.relative.yesterday": { en: "yesterday", it: "ieri", nb: "i går" },
  "chat.group.participants": {
    en: "{count} participants",
    it: "{count} partecipanti",
    nb: "{count} deltakere",
  },
  "chat.contactFallback.skipper": { en: "Skipper #{id}", it: "Skipper #{id}", nb: "Skipper #{id}" },
  "chat.contactFallback.customer": { en: "Customer #{id}", it: "Cliente #{id}", nb: "Kunde #{id}" },

  // --- support chat (skipper ↔ platform admin) ------------------------------
  "chat.support.title": { en: "Support", it: "Assistenza", nb: "Support" },
  "chat.support.subtitle": {
    en: "The Monterosso team",
    it: "Il team Monterosso",
    nb: "Monterosso-teamet",
  },
  "chat.support.admin": { en: "Support", it: "Assistenza", nb: "Support" },
  "chat.support.empty": {
    en: "No messages yet. Write to the Monterosso team — we're here to help.",
    it: "Ancora nessun messaggio. Scrivi al team Monterosso — siamo qui per aiutarti.",
    nb: "Ingen meldinger ennå. Skriv til Monterosso-teamet — vi er her for å hjelpe.",
  },
  "chat.support.placeholder": {
    en: "Write to support …",
    it: "Scrivi all'assistenza …",
    nb: "Skriv til support …",
  },
  "chat.support.locked": {
    en: "This conversation is locked.",
    it: "Questa conversazione è bloccata.",
    nb: "Denne samtalen er låst.",
  },
  "chat.support.sendError": {
    en: "The message wasn't sent. Check your connection and try again.",
    it: "Il messaggio non è stato inviato. Controlla la connessione e riprova.",
    nb: "Meldingen ble ikke sendt. Sjekk nettforbindelsen og prøv igjen.",
  },

  // --- "coming soon" section states -----------------------------------------
  "soon.receipts.frameTitle": { en: "Receipts", it: "Ricevute", nb: "Kvitteringer" },
  "soon.receipts.title": {
    en: "Receipts coming soon",
    it: "Ricevute in arrivo",
    nb: "Kvitteringer kommer snart",
  },
  "soon.receipts.hint": {
    en: "Your trip receipts will gather here, so you keep them safe in one place.",
    it: "Le ricevute dei tuoi viaggi si raccoglieranno qui, così le tieni al sicuro in un solo posto.",
    nb: "Her samles kvitteringene for turene dine, så du har dem trygt på ett sted.",
  },
  "soon.otherTrips.frameTitle": { en: "Other journeys", it: "Altri viaggi", nb: "Andre reiser" },
  "soon.otherTrips.title": {
    en: "Other journeys coming soon",
    it: "Altri viaggi in arrivo",
    nb: "Andre reiser kommer snart",
  },
  "soon.otherTrips.hint": {
    en: "More boat experiences along the coast will appear here as they become available.",
    it: "Altre esperienze in barca lungo la costa appariranno qui man mano che saranno disponibili.",
    nb: "Flere båtopplevelser langs kysten dukker opp her etter hvert som de blir tilgjengelige.",
  },
  "soon.otherCountries.frameTitle": { en: "Other countries", it: "Altri paesi", nb: "Andre land" },
  "soon.otherCountries.title": {
    en: "Other countries coming soon",
    it: "Altri paesi in arrivo",
    nb: "Andre land kommer snart",
  },
  "soon.otherCountries.hint": {
    en: "As the platform grows, you'll find trips in more countries here.",
    it: "Man mano che la piattaforma cresce, troverai qui viaggi in più paesi.",
    nb: "Etter hvert som plattformen vokser, finner du turer i flere land her.",
  },
  "soon.customers.frameTitle": { en: "Customers", it: "Clienti", nb: "Kunder" },
  "soon.customers.title": {
    en: "Customer overview coming soon",
    it: "Panoramica clienti in arrivo",
    nb: "Kundeoversikt kommer snart",
  },
  "soon.customers.hint": {
    en: 'A single overview of your customers across departures is coming here. In the meantime you\'ll find them under "My departures" and in the chat.',
    it: 'Una panoramica unica dei tuoi clienti su tutte le partenze arriverà qui. Nel frattempo li trovi in "Le mie partenze" e nella chat.',
    nb: "En samlet oversikt over kundene dine på tvers av avganger kommer hit. I mellomtiden ser du dem under «Mine avganger» og i chatten.",
  },

  // --- invite dialog --------------------------------------------------------
  "invite.title": {
    en: "Invite your travel party",
    it: "Invita i tuoi compagni di viaggio",
    nb: "Inviter reisefølget",
  },
  "invite.subtitle": {
    en: "Share a link with those you're travelling with, and they're in the same chat – no password.",
    it: "Condividi un link con chi viaggia con te e saranno nella stessa chat – senza password.",
    nb: "Del en lenke med dem du reiser sammen med, så er de inne i samme chat – uten passord.",
  },
  "invite.close": { en: "Close", it: "Chiudi", nb: "Lukk" },
  "invite.contactLabel": {
    en: "Email or phone (optional)",
    it: "Email o telefono (facoltativo)",
    nb: "E-post eller telefon (valgfritt)",
  },
  "invite.contactPlaceholder": {
    en: "name@example.com or +47 …",
    it: "nome@esempio.com o +39 …",
    nb: "navn@eksempel.no eller +47 …",
  },
  "invite.noAutoSend": {
    en: "You create a link and share it yourself. We don't send anything automatically yet.",
    it: "Crei un link e lo condividi tu. Per ora non inviamo nulla automaticamente.",
    nb: "Du lager en lenke du deler selv. Vi sender ingenting automatisk ennå.",
  },
  "invite.create": { en: "Create invite link", it: "Crea link d'invito", nb: "Lag invitasjonslenke" },
  "invite.copy": { en: "Copy", it: "Copia", nb: "Kopier" },
  "invite.copied": { en: "Copied", it: "Copiato", nb: "Kopiert" },
  "invite.copyAria": { en: "Copy link", it: "Copia link", nb: "Kopier lenke" },
  "invite.whatsapp": { en: "Share on WhatsApp", it: "Condividi su WhatsApp", nb: "Del på WhatsApp" },
  "invite.oneUse": {
    en: "The link is for one person and works once. Need to invite more? Create a new one.",
    it: "Il link è per una persona e funziona una volta sola. Devi invitare altri? Creane uno nuovo.",
    nb: "Lenken gjelder for én person og brukes én gang. Trenger du å invitere flere, lag en ny.",
  },
  "invite.again": { en: "Invite one more", it: "Invita un altro", nb: "Inviter en til" },
  "invite.waMessage": {
    en: "Hi! Join our travel party for the trip {code}. Tap here to enter the chat: {link}",
    it: "Ciao! Unisciti al nostro gruppo di viaggio per la gita {code}. Tocca qui per entrare nella chat: {link}",
    nb: "Hei! Bli med i reisefølget vårt for turen {code}. Trykk her for å komme inn i chatten: {link}",
  },

  // --- pending approval -----------------------------------------------------
  "pending.title": {
    en: "Waiting for approval",
    it: "In attesa di approvazione",
    nb: "Venter på godkjenning",
  },
  "pending.body": {
    en: "Thank you! Your email is confirmed. An administrator needs to approve your access before you can start conversations. We'll let you know as soon as your account is active.",
    it: "Grazie! La tua email è confermata. Un amministratore deve approvare il tuo accesso prima che tu possa avviare le conversazioni. Ti avviseremo appena l'account sarà attivo.",
    nb: "Takk! E-posten din er bekreftet. En administrator må godkjenne tilgangen din før du kan starte samtaler. Du får beskjed så snart kontoen er aktivert.",
  },
  "pending.stillPending": {
    en: "Still being reviewed — try again later.",
    it: "Ancora in fase di revisione — riprova più tardi.",
    nb: "Fortsatt under behandling — prøv igjen senere.",
  },
  "pending.recheck": {
    en: "Check status again",
    it: "Controlla di nuovo lo stato",
    nb: "Sjekk status på nytt",
  },
  "pending.logout": { en: "Log out", it: "Esci", nb: "Logg ut" },

  // --- auth: layout + shared fields -----------------------------------------
  "auth.tagline": {
    en: "Chat between guests and skippers",
    it: "Chat tra clienti e skipper",
    nb: "Chat mellom kunder og skippere",
  },
  "auth.common.continue": { en: "Continue", it: "Continua", nb: "Continue" },
  "auth.common.back": { en: "Back", it: "Indietro", nb: "Tilbake" },
  "auth.common.cancel": { en: "Cancel", it: "Annulla", nb: "Avbryt" },
  "auth.common.sendCode": { en: "Send code", it: "Invia codice", nb: "Send kode" },
  "auth.field.email": { en: "Email address", it: "Indirizzo email", nb: "E-postadresse" },
  "auth.field.password": { en: "Password", it: "Password", nb: "Passord" },
  "auth.field.contact": { en: "Email or phone", it: "Email o telefono", nb: "E-post eller telefon" },
  "auth.field.reservation": {
    en: "Reservation code (e.g. MT-210625-2)",
    it: "Codice di prenotazione (es. MT-210625-2)",
    nb: "Reservasjonskode (f.eks. MT-210625-2)",
  },
  "auth.field.phone": {
    en: "Phone / WhatsApp (e.g. +47 …)",
    it: "Telefono / WhatsApp (es. +39 …)",
    nb: "Telefon / WhatsApp (f.eks. +47 …)",
  },
  "auth.field.code": { en: "6-digit code", it: "Codice di 6 cifre", nb: "6-sifret kode" },
  "auth.field.newPassword": { en: "New password", it: "Nuova password", nb: "Nytt passord" },
  "auth.field.choosePassword": {
    en: "Choose a password (at least 8 characters)",
    it: "Scegli una password (almeno 8 caratteri)",
    nb: "Velg et passord (minst 8 tegn)",
  },

  // --- auth: passwordless / password login ----------------------------------
  "auth.login.welcome": { en: "Welcome", it: "Benvenuto", nb: "Velkommen" },
  "auth.login.welcomeSubtitle": {
    en: "Enter your email or phone, and you're in",
    it: "Inserisci email o telefono e sei dentro",
    nb: "Skriv e-post eller telefon, så er du inne",
  },
  "auth.login.hasPassword": { en: "Have a password?", it: "Hai una password?", nb: "Har du et passord?" },
  "auth.login.withPassword": {
    en: "Log in with password",
    it: "Accedi con password",
    nb: "Logg inn med passord",
  },
  "auth.login.passwordTitle": {
    en: "Log in with password",
    it: "Accedi con password",
    nb: "Logg inn med passord",
  },
  "auth.login.passwordSubtitle": {
    en: "For accounts secured with a password",
    it: "Per gli account protetti da password",
    nb: "For kontoer som er sikret med passord",
  },
  "auth.login.securedHint": {
    en: "This account is secured with a password. Enter your password to log in.",
    it: "Questo account è protetto da password. Inserisci la password per accedere.",
    nb: "Denne kontoen er sikret med passord. Skriv passordet ditt for å logge inn.",
  },
  "auth.login.forgot": { en: "Forgot password?", it: "Password dimenticata?", nb: "Glemt passord?" },
  "auth.login.submit": { en: "Log in", it: "Accedi", nb: "Logg inn" },
  "auth.login.backToPasswordless": {
    en: "Back — log in without a password",
    it: "Indietro — accedi senza password",
    nb: "Tilbake — logg inn uten passord",
  },
  "auth.login.link": { en: "Log in", it: "Accedi", nb: "Logg inn" },

  // --- auth: register (passwordless main path) ------------------------------
  "auth.register.title": { en: "Get started", it: "Inizia", nb: "Kom i gang" },
  "auth.register.subtitle": {
    en: "Enter your email or phone, and you're in",
    it: "Inserisci email o telefono e sei dentro",
    nb: "Skriv e-post eller telefon, så er du inne",
  },
  "auth.register.alreadyHasPassword": {
    en: "You already have an account with a password.",
    it: "Hai già un account con password.",
    nb: "Du har allerede en konto med passord.",
  },
  "auth.register.secureQuestion": {
    en: "Want to secure your account?",
    it: "Vuoi proteggere il tuo account?",
    nb: "Vil du sikre kontoen?",
  },
  "auth.register.createPassword": {
    en: "Create a password",
    it: "Crea una password",
    nb: "Lag et passord",
  },
  "auth.register.laterInProfile": {
    en: "You can also do this later in your profile.",
    it: "Puoi farlo anche più tardi nel tuo profilo.",
    nb: "Du kan også gjøre det senere i profilen.",
  },
  "auth.register.haveAccount": {
    en: "Already have an account?",
    it: "Hai già un account?",
    nb: "Har du allerede konto?",
  },

  // --- auth: secure-with-password (optional claim flow) ---------------------
  "auth.secure.title": {
    en: "Secure your account with a password",
    it: "Proteggi il tuo account con una password",
    nb: "Sikre kontoen med passord",
  },
  "auth.secure.subtitle": {
    en: "Optional. We'll send a code to the email we have on file.",
    it: "Facoltativo. Invieremo un codice all'email che abbiamo in archivio.",
    nb: "Valgfritt. Vi sender en kode til e-posten vi har registrert.",
  },
  "auth.secure.methodPlaceholder": { en: "Choose method", it: "Scegli metodo", nb: "Velg metode" },
  "auth.secure.methodEmail": { en: "With email", it: "Con email", nb: "Med e-post" },
  "auth.secure.methodPhone": {
    en: "With phone / WhatsApp",
    it: "Con telefono / WhatsApp",
    nb: "Med telefon / WhatsApp",
  },
  "auth.secure.methodReservation": {
    en: "With reservation code",
    it: "Con codice di prenotazione",
    nb: "Med reservasjonskode",
  },
  "auth.secure.backNoPassword": {
    en: "Back — go straight in without a password",
    it: "Indietro — entra subito senza password",
    nb: "Tilbake — kom rett inn uten passord",
  },

  // --- auth: verify (code + password) ---------------------------------------
  "auth.verify.title": { en: "Check your email", it: "Controlla la tua email", nb: "Sjekk e-posten din" },
  "auth.verify.subtitle": {
    en: "We sent a 6-digit code. Enter the code and choose a password.",
    it: "Abbiamo inviato un codice di 6 cifre. Inseriscilo e scegli una password.",
    nb: "Vi sendte en 6-sifret kode. Oppgi koden og velg et passord.",
  },
  "auth.verify.checkInbox": {
    en: "Check the inbox at {email}",
    it: "Controlla la casella di {email}",
    nb: "Sjekk innboksen til {email}",
  },
  "auth.verify.savePassword": { en: "Save password", it: "Salva password", nb: "Lagre passord" },
  "auth.demo.hint": {
    en: "Demo mode — use code {code}.",
    it: "Modalità demo — usa il codice {code}.",
    nb: "Demo-modus — bruk kode {code}.",
  },

  // --- auth: join (invite landing) ------------------------------------------
  "auth.join.missingTitle": { en: "No invitation", it: "Nessun invito", nb: "Mangler invitasjon" },
  "auth.join.missingSubtitle": {
    en: "This link has no invitation",
    it: "Questo link non contiene un invito",
    nb: "Denne lenken har ingen invitasjon",
  },
  "auth.join.missingBody": {
    en: "Ask whoever invited you to send the link again.",
    it: "Chiedi a chi ti ha invitato di inviare di nuovo il link.",
    nb: "Be den som inviterte deg om å sende lenken på nytt.",
  },
  "auth.join.invalidTitle": { en: "Invalid invitation", it: "Invito non valido", nb: "Ugyldig invitasjon" },
  "auth.join.invalidSubtitle": {
    en: "We couldn't find the trip this link points to",
    it: "Non abbiamo trovato la gita a cui punta questo link",
    nb: "Vi fant ikke turen denne lenken peker på",
  },
  "auth.join.invalidBody": {
    en: "The link may be mistyped. Ask your travel party for a new one.",
    it: "Il link potrebbe essere errato. Chiedi ai tuoi compagni di viaggio un nuovo link.",
    nb: "Lenken kan være feilskrevet. Be om en ny fra reisefølget ditt.",
  },
  "auth.join.title": {
    en: "Join your travel party",
    it: "Unisciti al gruppo di viaggio",
    nb: "Bli med i reisefølget",
  },
  "auth.join.subtitle": {
    en: "Enter your email or phone, and you're in — no password",
    it: "Inserisci email o telefono e sei dentro — senza password",
    nb: "Skriv e-post eller telefon, så er du inne — uten passord",
  },
  "auth.join.alreadyUsed": {
    en: "This invitation has already been used. Ask your travel party for a new one.",
    it: "Questo invito è già stato usato. Chiedi ai tuoi compagni di viaggio un nuovo invito.",
    nb: "Denne invitasjonen er allerede brukt. Be om en ny fra reisefølget ditt.",
  },
  "auth.join.securedPrefix": {
    en: "This account is secured with a password.",
    it: "Questo account è protetto da password.",
    nb: "Denne kontoen er sikret med passord.",
  },
  "auth.join.securedSuffix": { en: "first.", it: "prima.", nb: "først." },
  "auth.join.submit": { en: "Join", it: "Unisciti", nb: "Bli med" },

  // --- auth: forgot password ------------------------------------------------
  "auth.forgot.doneTitle": {
    en: "Password updated",
    it: "Password aggiornata",
    nb: "Passordet er oppdatert",
  },
  "auth.forgot.doneBody": {
    en: "You can now log in with your new password.",
    it: "Ora puoi accedere con la nuova password.",
    nb: "Du kan nå logge inn med det nye passordet.",
  },
  "auth.forgot.backToLogin": { en: "Back to login", it: "Torna all'accesso", nb: "Tilbake til innlogging" },
  "auth.forgot.codeSentTo": {
    en: "We sent a 6-digit code to {email}.",
    it: "Abbiamo inviato un codice di 6 cifre a {email}.",
    nb: "Vi sendte en 6-sifret kode til {email}.",
  },
  "auth.forgot.resetSubmit": {
    en: "Reset password",
    it: "Reimposta password",
    nb: "Tilbakestill passord",
  },
  "auth.forgot.requestTitle": { en: "Forgot password?", it: "Password dimenticata?", nb: "Glemt passord?" },
  "auth.forgot.requestBody": {
    en: "Enter your email and we'll send you a code to reset your password.",
    it: "Inserisci la tua email e ti invieremo un codice per reimpostare la password.",
    nb: "Oppgi e-posten din, så sender vi deg en kode for å tilbakestille passordet.",
  },

  // --- auth: password show/hide toggle --------------------------------------
  "auth.password.show": { en: "Show password", it: "Mostra password", nb: "Vis passord" },
  "auth.password.hide": { en: "Hide password", it: "Nascondi password", nb: "Skjul passord" },

  // --- auth: form validation (zod messages) ---------------------------------
  "auth.validation.emailRequired": {
    en: "Email is required",
    it: "L'email è obbligatoria",
    nb: "E-post er påkrevd",
  },
  "auth.validation.emailInvalid": {
    en: "Enter a valid email address",
    it: "Inserisci un indirizzo email valido",
    nb: "Oppgi en gyldig e-postadresse",
  },
  "auth.validation.reservationRequired": {
    en: "Reservation code is required",
    it: "Il codice di prenotazione è obbligatorio",
    nb: "Reservasjonskode er påkrevd",
  },
  "auth.validation.reservationInvalid": {
    en: "Invalid reservation code (e.g. MT-210625-2)",
    it: "Codice di prenotazione non valido (es. MT-210625-2)",
    nb: "Ugyldig reservasjonskode (f.eks. MT-210625-2)",
  },
  "auth.validation.phoneRequired": {
    en: "Phone number is required",
    it: "Il numero di telefono è obbligatorio",
    nb: "Telefonnummer er påkrevd",
  },
  "auth.validation.phoneInvalid": {
    en: "Enter a valid phone number",
    it: "Inserisci un numero di telefono valido",
    nb: "Oppgi et gyldig telefonnummer",
  },
  "auth.validation.passwordMin": { en: "At least 8 characters", it: "Almeno 8 caratteri", nb: "Minst 8 tegn" },
  "auth.validation.passwordRequired": {
    en: "Password is required",
    it: "La password è obbligatoria",
    nb: "Passord er påkrevd",
  },
  "auth.validation.contactRequired": {
    en: "Enter your email or phone",
    it: "Inserisci email o telefono",
    nb: "Skriv e-post eller telefon",
  },
  "auth.validation.contactInvalid": {
    en: "Enter a valid email or phone",
    it: "Inserisci un'email o un telefono valido",
    nb: "Skriv en gyldig e-post eller telefon",
  },
  "auth.validation.methodRequired": { en: "Choose a method", it: "Scegli un metodo", nb: "Velg en metode" },
  "auth.validation.codeLength": {
    en: "Enter the 6-digit code",
    it: "Inserisci il codice di 6 cifre",
    nb: "Oppgi den 6-sifrede koden",
  },
  "auth.validation.codeDigits": {
    en: "The code is 6 digits",
    it: "Il codice è di 6 cifre",
    nb: "Koden er 6 sifre",
  },
} satisfies Record<string, Entry>;

/** Every valid translation key (the exact union of the dictionary's keys). */
export type TranslationKey = keyof typeof dictionary;
