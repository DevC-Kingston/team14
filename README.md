# Mentoree

[//]: <> (Please use this Winning Hackathon Application as an example:
https://devpost.com/software/rewise-ai-powered-revision-bot)

**Team Members**: Rolando Alberts, Ashleigh Barker, Brandon Chung, Paul Clue, Sassania Hibbert

## Inspiration

In Jamaica, finding someone with experience, who can guide you along a chosen career path can prove to be a difficult task. This especially goes for people who tend to be introverted and find it a hassle to approach others. The idea for Mentoree is to allow persons seeking guidance on a career path to anonymously connect to a professional in their desired field.

## What it does

Mentoree allows aspiring professionals of any field to seek out and get into contact with experienced professionals in their field of choice. Mentors and mentees will be able to participate in informative sessions where the mentor provides information on topics related to the mentee's career path.


## Chatbot’s features and use cases

1. The user is asked whether they are a mentor or mentee
2. The user states their field of interest
3. The user asks to be matched
4. Once a mentor and mentee are matched they may send messages to each other through the bot
5. The user may disconnect from the conversation at any time
6. Each conversation lasts 15 minutes, but users may opt to extend it
7. When a conversation ends, both users will be asked to rate their experience


## How we built it

We created a Webhook using NodeJS and Express which enabled us to receive messages from Facebook Messenger. After receiving these messages, we send customize responses to users using Facebook's messenger API.


## Challenges we ran into

1. Working as a remote teams has its challenges
    1. Unstable internet connections affected our collaboration
2. Working with new people
3. Getting accustomed to tools we have never used before
4. Using new programming languages and frameworks


## Accomplishments that we're proud of

* Learning new languages and frameworks
* Being exposed to a new platform for development
* Delivering a working product in a short period of time
* Learning new marketing tools


## What we learned

* Learning about new languages and frameworks is not as hard as we initially thought
* Creating a pitch can be more stressful than developing a product
* New approaches to market a product


## What's next for “Mentoree”

1. Users will be able to rate their experience after a conversation
2. If users have a bad conversation they may block the other user
3. Users will be able to continue a conversation after 15 minutes if they enjoy their match
4. Mentors may accumulate points based on whether or not mentees enjoy their mentorship sessions
5. Users should be able to adjust their profile
6. Mentors may undergo a method of verification to prove affinity in their stated field


## Built With - provide the tech stack used

* Node JS - backend
* Express - API Framework
* Heroku Hosting


## Try it out

[Public GitHub Page](https://devc-kingston.github.io/team14/) <br>
[See our GitHub repository](https://github.com/DevC-Kingston/team14)
