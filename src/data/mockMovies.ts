// Mock catalog for the Andshow UI shell.
// Shapes mirror TMDB so this file can be replaced by a real TMDB client later.
// Image paths resolve against https://image.tmdb.org/t/p/{size} — see lib/tmdb-image.ts.
import type { ContinueWatchingEntry, RailDefinition, Title } from '@/lib/types'


export const MOCK_TITLES: readonly Title[] = [
  {
    "id": 27205,
    "mediaType": "movie",
    "name": "Inception",
    "year": 2010,
    "yearLabel": "2010",
    "runtimeLabel": "2h 28m",
    "rating": 8.4,
    "genres": [
      "Action",
      "Science Fiction",
      "Adventure"
    ],
    "overview": "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
    "cast": [
      "Leonardo DiCaprio",
      "Joseph Gordon-Levitt",
      "Elliot Page",
      "Tom Hardy"
    ],
    "posterPath": "/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
    "backdropPath": "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg"
  },
  {
    "id": 157336,
    "mediaType": "movie",
    "name": "Interstellar",
    "year": 2014,
    "yearLabel": "2014",
    "runtimeLabel": "2h 49m",
    "rating": 8.5,
    "genres": [
      "Adventure",
      "Drama",
      "Science Fiction"
    ],
    "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    "cast": [
      "Matthew McConaughey",
      "Anne Hathaway",
      "Jessica Chastain",
      "Michael Caine"
    ],
    "posterPath": "/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
    "backdropPath": "/2ssWTSVklAEc98frZUQhgtGHx7s.jpg"
  },
  {
    "id": 693134,
    "mediaType": "movie",
    "name": "Dune: Part Two",
    "year": 2024,
    "yearLabel": "2024",
    "runtimeLabel": "2h 47m",
    "rating": 8.1,
    "genres": [
      "Science Fiction",
      "Adventure"
    ],
    "overview": "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, Paul endeavors to prevent a terrible future only he can foresee.",
    "cast": [
      "Timothée Chalamet",
      "Zendaya",
      "Rebecca Ferguson",
      "Austin Butler"
    ],
    "posterPath": "/heM4XKC0jA8fTSNe8F7oUkcJV7Z.jpg",
    "backdropPath": "/eZ239CUp1d6OryZEBPnO2n87gMG.jpg"
  },
  {
    "id": 335984,
    "mediaType": "movie",
    "name": "Blade Runner 2049",
    "year": 2017,
    "yearLabel": "2017",
    "runtimeLabel": "2h 44m",
    "rating": 7.6,
    "genres": [
      "Science Fiction",
      "Drama"
    ],
    "overview": "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos. K's discovery leads him on a quest to find Rick Deckard, a former LAPD blade runner who has been missing for 30 years.",
    "cast": [
      "Ryan Gosling",
      "Harrison Ford",
      "Ana de Armas",
      "Sylvia Hoeks"
    ],
    "posterPath": "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    "backdropPath": "/mVr0UiqyltcfqxbAUcLl9zWL8ah.jpg"
  },
  {
    "id": 872585,
    "mediaType": "movie",
    "name": "Oppenheimer",
    "year": 2023,
    "yearLabel": "2023",
    "runtimeLabel": "3h 1m",
    "rating": 8,
    "genres": [
      "Drama",
      "History"
    ],
    "overview": "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    "cast": [
      "Cillian Murphy",
      "Emily Blunt",
      "Robert Downey Jr.",
      "Florence Pugh"
    ],
    "posterPath": "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    "backdropPath": "/neeNHeXjMF5fXoCJRsOmkNGC7q.jpg"
  },
  {
    "id": 414906,
    "mediaType": "movie",
    "name": "The Batman",
    "year": 2022,
    "yearLabel": "2022",
    "runtimeLabel": "2h 57m",
    "rating": 7.7,
    "genres": [
      "Crime",
      "Mystery",
      "Thriller"
    ],
    "overview": "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.",
    "cast": [
      "Robert Pattinson",
      "Zoë Kravitz",
      "Paul Dano",
      "Colin Farrell"
    ],
    "posterPath": "/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    "backdropPath": "/IYUD7rAIXzBM91TT3Z5fILUS7n.jpg"
  },
  {
    "id": 496243,
    "mediaType": "movie",
    "name": "Parasite",
    "year": 2019,
    "yearLabel": "2019",
    "runtimeLabel": "2h 13m",
    "rating": 8.5,
    "genres": [
      "Comedy",
      "Thriller",
      "Drama"
    ],
    "overview": "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    "cast": [
      "Song Kang-ho",
      "Lee Sun-kyun",
      "Cho Yeo-jeong",
      "Choi Woo-shik"
    ],
    "posterPath": "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    "backdropPath": "/wCuUKiRaz0wEESsYqmQy005xvTE.jpg"
  },
  {
    "id": 244786,
    "mediaType": "movie",
    "name": "Whiplash",
    "year": 2014,
    "yearLabel": "2014",
    "runtimeLabel": "1h 47m",
    "rating": 8.4,
    "genres": [
      "Drama",
      "Music",
      "Thriller"
    ],
    "overview": "Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost, even his humanity.",
    "cast": [
      "Miles Teller",
      "J.K. Simmons",
      "Melissa Benoist"
    ],
    "posterPath": "/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    "backdropPath": "/wbQa0EnWUyRzQ5d1pHLNRlmsCUP.jpg"
  },
  {
    "id": 76341,
    "mediaType": "movie",
    "name": "Mad Max: Fury Road",
    "year": 2015,
    "yearLabel": "2015",
    "runtimeLabel": "2h 1m",
    "rating": 7.6,
    "genres": [
      "Action",
      "Adventure",
      "Science Fiction"
    ],
    "overview": "An apocalyptic story set in the furthest reaches of our planet, in a stark desert landscape where humanity is broken, and most everyone is crazed fighting for the necessities of life. Within this world exist two rebels on the run who just might be able to restore order.",
    "cast": [
      "Tom Hardy",
      "Charlize Theron",
      "Nicholas Hoult"
    ],
    "posterPath": "/hA2ple9q4qnwxp3hKVNhroipsir.jpg",
    "backdropPath": "/uT895WNwm0aIJRtGizcQhrejWUo.jpg"
  },
  {
    "id": 313369,
    "mediaType": "movie",
    "name": "La La Land",
    "year": 2016,
    "yearLabel": "2016",
    "runtimeLabel": "2h 9m",
    "rating": 7.9,
    "genres": [
      "Comedy",
      "Drama",
      "Romance"
    ],
    "overview": "Mia, an aspiring actress, serves lattes to movie stars in between auditions and Sebastian, a jazz musician, scrapes by playing cocktail party gigs in dingy bars, but as success mounts they are faced with decisions that begin to fray the fragile fabric of their love affair, and the dreams they worked so hard to maintain in each other threaten to rip them apart.",
    "cast": [
      "Ryan Gosling",
      "Emma Stone",
      "John Legend"
    ],
    "posterPath": "/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    "backdropPath": "/nlPCdZlHtRNcF6C9hzUH4ebmV1w.jpg"
  },
  {
    "id": 120467,
    "mediaType": "movie",
    "name": "The Grand Budapest Hotel",
    "year": 2014,
    "yearLabel": "2014",
    "runtimeLabel": "1h 40m",
    "rating": 8,
    "genres": [
      "Comedy",
      "Drama"
    ],
    "overview": "The Grand Budapest Hotel tells of a legendary concierge at a famous European hotel between the wars and his friendship with a young employee who becomes his trusted protégé. The story involves the theft and recovery of a priceless Renaissance painting, the battle for an enormous family fortune and the slow and then sudden upheavals that transformed Europe during the first half of the 20th century.",
    "cast": [
      "Ralph Fiennes",
      "Tony Revolori",
      "Saoirse Ronan",
      "Adrien Brody"
    ],
    "posterPath": "/zOVCqKUzjFKqa1eDMcOzvXwthY4.jpg",
    "backdropPath": "/9udCLTxTFl28RxnK8Q05E154ZGa.jpg"
  },
  {
    "id": 329865,
    "mediaType": "movie",
    "name": "Arrival",
    "year": 2016,
    "yearLabel": "2016",
    "runtimeLabel": "1h 56m",
    "rating": 7.6,
    "genres": [
      "Drama",
      "Science Fiction",
      "Mystery"
    ],
    "overview": "Taking place after alien crafts land around the world, an expert linguist is recruited by the military to determine whether they come in peace or are a threat.",
    "cast": [
      "Amy Adams",
      "Jeremy Renner",
      "Forest Whitaker"
    ],
    "posterPath": "/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
    "backdropPath": "/uKPbFF08QkRMvIAsgCh1soeyPhZ.jpg"
  },
  {
    "id": 152601,
    "mediaType": "movie",
    "name": "Her",
    "year": 2013,
    "yearLabel": "2013",
    "runtimeLabel": "2h 6m",
    "rating": 7.8,
    "genres": [
      "Romance",
      "Science Fiction",
      "Drama"
    ],
    "overview": "In the not so distant future, Theodore, a lonely writer, purchases a newly developed operating system designed to meet the user's every need. To Theodore's surprise, a romantic relationship develops between him and his operating system. This unconventional love story blends science fiction and romance in a sweet tale that explores the nature of love and the ways that technology isolates and connects us all.",
    "cast": [
      "Joaquin Phoenix",
      "Scarlett Johansson",
      "Amy Adams",
      "Rooney Mara"
    ],
    "posterPath": "/eCOtqtfvn7mxGl6nfmq4b1exJRc.jpg",
    "backdropPath": "/sPPsR9f4K0movWVQ99u4uMqFzEL.jpg"
  },
  {
    "id": 64690,
    "mediaType": "movie",
    "name": "Drive",
    "year": 2011,
    "yearLabel": "2011",
    "runtimeLabel": "1h 40m",
    "rating": 7.6,
    "genres": [
      "Drama",
      "Thriller",
      "Crime"
    ],
    "overview": "Driver is a skilled Hollywood stuntman who moonlights as a getaway driver for criminals. Though he projects an icy exterior, lately he's been warming up to a pretty neighbor named Irene and her young son, Benicio. When Irene's husband gets out of jail, he enlists Driver's help in a million-dollar heist. The job goes horribly wrong, and Driver must risk his life to protect Irene and Benicio from the vengeful masterminds behind the robbery.",
    "cast": [
      "Ryan Gosling",
      "Carey Mulligan",
      "Bryan Cranston",
      "Oscar Isaac"
    ],
    "posterPath": "/602vevIURmpDfzbnv5Ubi6wIkQm.jpg",
    "backdropPath": "/iymDDg4upZWgpbSeiE1JCjsSPBs.jpg"
  },
  {
    "id": 843,
    "mediaType": "movie",
    "name": "In the Mood for Love",
    "year": 2000,
    "yearLabel": "2000",
    "runtimeLabel": "1h 39m",
    "rating": 8.1,
    "genres": [
      "Drama",
      "Romance"
    ],
    "overview": "In 1960s Hong Kong, two neighbors form an intimate bond after making a discovery about their spouses in this visually stunning tale of unrequited love.",
    "cast": [
      "Tony Leung Chiu-wai",
      "Maggie Cheung"
    ],
    "posterPath": "/iYypPT4bhqXfq1b6EnmxvRt6b2Y.jpg",
    "backdropPath": "/ffQFnAUm2Uu4RU0nijpjPRf9TBT.jpg"
  },
  {
    "id": 155,
    "mediaType": "movie",
    "name": "The Dark Knight",
    "year": 2008,
    "yearLabel": "2008",
    "runtimeLabel": "2h 32m",
    "rating": 8.5,
    "genres": [
      "Action",
      "Crime",
      "Thriller"
    ],
    "overview": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
    "cast": [
      "Christian Bale",
      "Heath Ledger",
      "Aaron Eckhart",
      "Gary Oldman"
    ],
    "posterPath": "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    "backdropPath": "/dqK9Hag1054tghRQSqLSfrkvQnA.jpg"
  },
  {
    "id": 680,
    "mediaType": "movie",
    "name": "Pulp Fiction",
    "year": 1994,
    "yearLabel": "1994",
    "runtimeLabel": "2h 34m",
    "rating": 8.5,
    "genres": [
      "Thriller",
      "Crime",
      "Comedy"
    ],
    "overview": "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.",
    "cast": [
      "John Travolta",
      "Samuel L. Jackson",
      "Uma Thurman",
      "Bruce Willis"
    ],
    "posterPath": "/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg",
    "backdropPath": "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg"
  },
  {
    "id": 129,
    "mediaType": "movie",
    "name": "Spirited Away",
    "year": 2001,
    "yearLabel": "2001",
    "runtimeLabel": "2h 5m",
    "rating": 8.5,
    "genres": [
      "Animation",
      "Family",
      "Fantasy"
    ],
    "overview": "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
    "cast": [
      "Rumi Hiiragi",
      "Miyu Irino",
      "Mari Natsuki"
    ],
    "posterPath": "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    "backdropPath": "/dyJvKsNs2KP8qQnAXbRwDjblViy.jpg"
  },
  {
    "id": 545611,
    "mediaType": "movie",
    "name": "Everything Everywhere All at Once",
    "year": 2022,
    "yearLabel": "2022",
    "runtimeLabel": "2h 20m",
    "rating": 7.7,
    "genres": [
      "Action",
      "Adventure",
      "Science Fiction"
    ],
    "overview": "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what's important to her by connecting with the lives she could have led in other universes.",
    "cast": [
      "Michelle Yeoh",
      "Ke Huy Quan",
      "Stephanie Hsu",
      "Jamie Lee Curtis"
    ],
    "posterPath": "/u68AjlvlutfEIcpmbYpKcdi09ut.jpg",
    "backdropPath": "/ss0Os3uWJfQAENILHZUdX8Tt1OC.jpg"
  },
  {
    "id": 792307,
    "mediaType": "movie",
    "name": "Poor Things",
    "year": 2023,
    "yearLabel": "2023",
    "runtimeLabel": "2h 21m",
    "rating": 7.6,
    "genres": [
      "Science Fiction",
      "Romance",
      "Comedy"
    ],
    "overview": "Brought back to life by an unorthodox scientist, a young woman runs off with a lawyer on a whirlwind adventure across the continents. Free from the prejudices of her times, she grows steadfast in her purpose to stand for equality and liberation.",
    "cast": [
      "Emma Stone",
      "Mark Ruffalo",
      "Willem Dafoe",
      "Ramy Youssef"
    ],
    "posterPath": "/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
    "backdropPath": "/zh6IdheEYinU4TPtorWsjx6qPQE.jpg"
  },
  {
    "id": 238,
    "mediaType": "movie",
    "name": "The Godfather",
    "year": 1972,
    "yearLabel": "1972",
    "runtimeLabel": "2h 55m",
    "rating": 8.7,
    "genres": [
      "Drama",
      "Crime"
    ],
    "overview": "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.",
    "cast": [
      "Marlon Brando",
      "Al Pacino",
      "James Caan",
      "Robert Duvall"
    ],
    "posterPath": "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    "backdropPath": "/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg"
  },
  {
    "id": 6977,
    "mediaType": "movie",
    "name": "No Country for Old Men",
    "year": 2007,
    "yearLabel": "2007",
    "runtimeLabel": "2h 2m",
    "rating": 7.9,
    "genres": [
      "Crime",
      "Thriller",
      "Western"
    ],
    "overview": "Llewelyn Moss stumbles upon dead bodies, $2 million and a hoard of heroin in a Texas desert, but methodical killer Anton Chigurh comes looking for it, with local sheriff Ed Tom Bell hot on his trail. The roles of prey and predator blur as the violent pursuit of money and justice collide.",
    "cast": [
      "Tommy Lee Jones",
      "Javier Bardem",
      "Josh Brolin",
      "Kelly Macdonald"
    ],
    "posterPath": "/uB7RDZby43Wvu8SKGHHTwGyTDBX.jpg",
    "backdropPath": "/gddUsvfyySrM5k8B8wwJy2VRlBx.jpg"
  },
  {
    "id": 1396,
    "mediaType": "tv",
    "name": "Breaking Bad",
    "year": 2008,
    "yearLabel": "2008–2013",
    "runtimeLabel": "5 Seasons",
    "rating": 8.9,
    "genres": [
      "Drama",
      "Crime"
    ],
    "overview": "Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family's financial future at any cost as he enters the dangerous world of drugs and crime.",
    "cast": [
      "Bryan Cranston",
      "Aaron Paul",
      "Anna Gunn",
      "Bob Odenkirk"
    ],
    "posterPath": "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    "backdropPath": "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg"
  },
  {
    "id": 95396,
    "mediaType": "tv",
    "name": "Severance",
    "year": 2022,
    "yearLabel": "2022–",
    "runtimeLabel": "2 Seasons",
    "rating": 8.4,
    "genres": [
      "Drama",
      "Mystery",
      "Sci-Fi & Fantasy"
    ],
    "overview": "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.",
    "cast": [
      "Adam Scott",
      "Britt Lower",
      "Zach Cherry",
      "Patricia Arquette"
    ],
    "posterPath": "/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg",
    "backdropPath": "/ixgFmf1X59PUZam2qbAfskx2gQr.jpg"
  },
  {
    "id": 136315,
    "mediaType": "tv",
    "name": "The Bear",
    "year": 2022,
    "yearLabel": "2022–2026",
    "runtimeLabel": "4 Seasons",
    "rating": 8.1,
    "genres": [
      "Drama",
      "Comedy"
    ],
    "overview": "Carmy, a young fine-dining chef, comes home to Chicago to run his family sandwich shop. As he fights to transform the shop and himself, he works alongside a rough-around-the-edges crew that ultimately reveal themselves as his chosen family.",
    "cast": [
      "Jeremy Allen White",
      "Ayo Edebiri",
      "Ebon Moss-Bachrach"
    ],
    "posterPath": "/eKfVzzEazSIjJMrw9ADa2x8ksLz.jpg",
    "backdropPath": "/aJtG4txtmiRHwAAqENQHZvBs6kY.jpg"
  },
  {
    "id": 76331,
    "mediaType": "tv",
    "name": "Succession",
    "year": 2018,
    "yearLabel": "2018–2023",
    "runtimeLabel": "4 Seasons",
    "rating": 8.3,
    "genres": [
      "Drama",
      "Comedy"
    ],
    "overview": "Follow the lives of the Roy family as they contemplate their future once their aging father begins to step back from the media and entertainment conglomerate they control.",
    "cast": [
      "Brian Cox",
      "Jeremy Strong",
      "Sarah Snook",
      "Kieran Culkin"
    ],
    "posterPath": "/z0XiwdrCQ9yVIr4O0pxzaAYRxdW.jpg",
    "backdropPath": "/bcdUYUFk8GdpZJPiSAas9UeocLH.jpg"
  },
  {
    "id": 87108,
    "mediaType": "tv",
    "name": "Chernobyl",
    "year": 2019,
    "yearLabel": "2019–2019",
    "runtimeLabel": "Miniseries",
    "rating": 8.7,
    "genres": [
      "Drama"
    ],
    "overview": "The true story of one of the worst man-made catastrophes in history: the catastrophic nuclear accident at Chernobyl. A tale of the brave men and women who sacrificed to save Europe from unimaginable disaster.",
    "cast": [
      "Jared Harris",
      "Stellan Skarsgård",
      "Emily Watson"
    ],
    "posterPath": "/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg",
    "backdropPath": "/3URK0z9PzpVNJrGE7XOuyy6KFzk.jpg"
  },
  {
    "id": 70523,
    "mediaType": "tv",
    "name": "Dark",
    "year": 2017,
    "yearLabel": "2017–2020",
    "runtimeLabel": "3 Seasons",
    "rating": 8.4,
    "genres": [
      "Crime",
      "Drama",
      "Sci-Fi & Fantasy",
      "Mystery"
    ],
    "overview": "A missing child sets four families on a frantic hunt for answers as they unearth a mind-bending mystery that spans three generations.",
    "cast": [
      "Louis Hofmann",
      "Lisa Vicari",
      "Andreas Pietschmann"
    ],
    "posterPath": "/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg",
    "backdropPath": "/3jDXL4Xvj3AzDOF6UH1xeyHW8MH.jpg"
  },
  {
    "id": 100088,
    "mediaType": "tv",
    "name": "The Last of Us",
    "year": 2023,
    "yearLabel": "2023–",
    "runtimeLabel": "2 Seasons",
    "rating": 8.4,
    "genres": [
      "Drama"
    ],
    "overview": "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone. What starts as a small job soon becomes a brutal, heartbreaking journey, as they both must traverse the United States and depend on each other for survival.",
    "cast": [
      "Pedro Pascal",
      "Bella Ramsey"
    ],
    "posterPath": "/dmo6TYuuJgaYinXBPjrgG9mB5od.jpg",
    "backdropPath": "/acevLdSl5I2MK5RYAm7gwAndt1w.jpg"
  },
  {
    "id": 83867,
    "mediaType": "tv",
    "name": "Andor",
    "year": 2022,
    "yearLabel": "2022–2025",
    "runtimeLabel": "2 Seasons",
    "rating": 8.3,
    "genres": [
      "Sci-Fi & Fantasy",
      "Action & Adventure",
      "Drama"
    ],
    "overview": "In an era filled with danger, deception and intrigue, Cassian Andor will discover the difference he can make in the struggle against the tyrannical Galactic Empire. He embarks on a path that is destined to turn him into a rebel hero.",
    "cast": [
      "Diego Luna",
      "Stellan Skarsgård",
      "Genevieve O’Reilly",
      "Kyle Soller"
    ],
    "posterPath": "/khZqmwHQicTYoS7Flreb9EddFZC.jpg",
    "backdropPath": "/quCeAmVQHfsdcYkicbxZWVauCVb.jpg"
  },
  {
    "id": 60059,
    "mediaType": "tv",
    "name": "Better Call Saul",
    "year": 2015,
    "yearLabel": "2015–2022",
    "runtimeLabel": "6 Seasons",
    "rating": 8.7,
    "genres": [
      "Crime",
      "Drama"
    ],
    "overview": "Six years before Saul Goodman meets Walter White. We meet him when the man who will become Saul Goodman is known as Jimmy McGill, a small-time lawyer searching for his destiny, and, more immediately, hustling to make ends meet. Working alongside, and, often, against Jimmy, is “fixer” Mike Ehrmantraut. The series tracks Jimmy’s transformation into Saul Goodman, the man who puts “criminal” in “criminal lawyer\".",
    "cast": [
      "Bob Odenkirk",
      "Rhea Seehorn",
      "Jonathan Banks",
      "Giancarlo Esposito"
    ],
    "posterPath": "/zjg4jpK1Wp2kiRvtt5ND0kznako.jpg",
    "backdropPath": "/og2jKploGHYnCz68vV1nRSEE0xV.jpg"
  },
  {
    "id": 62560,
    "mediaType": "tv",
    "name": "Mr. Robot",
    "year": 2015,
    "yearLabel": "2015–2019",
    "runtimeLabel": "4 Seasons",
    "rating": 8.3,
    "genres": [
      "Crime",
      "Drama"
    ],
    "overview": "A young programmer, Elliot, suffers from a debilitating anti-social disorder and decides that he can only connect to people by hacking them. He wields his skills as a weapon to protect the people that he cares about. Elliot finds himself in the intersection between a cybersecurity firm he works for and the underworld organizations that are recruiting him to bring down corporate America.",
    "cast": [
      "Rami Malek",
      "Christian Slater",
      "Carly Chaikin",
      "Portia Doubleday"
    ],
    "posterPath": "/kv1nRqgebSsREnd7vdC2pSGjpLo.jpg",
    "backdropPath": "/4ceSkV7cmCon4exXaZwuhW1VdE0.jpg"
  }
]

export const FEATURED_IDS: readonly number[] = [157336,693134,843,95396,335984]

export const RAIL_DEFINITIONS: readonly RailDefinition[] = [
  {
    "id": "trending",
    "heading": "Trending Now",
    "layout": "poster",
    "ids": [
      693134,
      872585,
      95396,
      136315,
      100088,
      792307,
      545611,
      414906,
      83867,
      335984,
      244786,
      496243
    ]
  },
  {
    "id": "top-rated",
    "heading": "Top Rated",
    "layout": "poster",
    "ids": [
      238,
      1396,
      155,
      87108,
      129,
      680,
      60059,
      496243,
      157336,
      244786,
      843,
      6977
    ]
  },
  {
    "id": "continue-watching",
    "heading": "Continue Watching",
    "layout": "wide",
    "ids": [
      95396,
      693134,
      843,
      1396,
      329865,
      64690
    ]
  },
  {
    "id": "new-releases",
    "heading": "New Releases",
    "layout": "poster",
    "ids": [
      693134,
      792307,
      872585,
      136315,
      100088,
      95396,
      545611,
      414906,
      83867,
      27205
    ]
  }
]

export const CONTINUE_WATCHING: readonly ContinueWatchingEntry[] = [
  {
    "titleId": 95396,
    "progress": 0.68,
    "remainingLabel": "S2 · E7"
  },
  {
    "titleId": 693134,
    "progress": 0.35,
    "remainingLabel": "1h 48m left"
  },
  {
    "titleId": 843,
    "progress": 0.15,
    "remainingLabel": "1h 24m left"
  },
  {
    "titleId": 1396,
    "progress": 0.82,
    "remainingLabel": "S5 · E11"
  },
  {
    "titleId": 329865,
    "progress": 0.5,
    "remainingLabel": "58m left"
  },
  {
    "titleId": 64690,
    "progress": 0.44,
    "remainingLabel": "56m left"
  }
]
