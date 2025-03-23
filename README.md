# EOS Blockchain Number Generation and Blackjack
## What is this?
This project is my attempt at making a random number generator using the EOS blockchain to generate provably random numbers.
The project, as of now, consists of 2 parts. A random number generation page, and a Blackjack page. These are proof-of-concepts, and have a lot of room for improvement.
## How does it work?

### EOS Number Generation
The number generation algorith in this project works in a couple of steps:

Firstly, the number of the latest EOS block in the blockchain is fetched from an API. To account for potential delays, the number of the block is increased by +1, to try to prevent getting an "older" block than the newest one. This is not essential in this proof-of-concept, but could be needed in production. This is because using an older block could compromise the random number generation, and make it predictable.

Afterwards, the BlockID, aka Block Hash, is fetched using the same API. This sometimes has to retry a couple of times, because of the '+1' to the block number.
The BlockID in combination with the client seed, the nonce and the number of numbers which has been generated during the current run of the function (To make sure all numbers are individually generated incase you generate multiple numbers at the same time.) is then converted into a SHA-256 Hash as a hexadecimal string.

Finally, the generated SHA-256 string is then converted into a BigInt using the BigInt() function, and reduced to an integer into the desired range using a modulo operation. In the case of Blackjack, a number between 0-51 is generated.

### Blackjack Game
I chose to make a blackjack game as it was a relatively simple way to demonstrate one potential use of the Provably Random number generation.

The blackjack game is still a work in progress, and more features might be added or updated later.

As of now, It contains the following features:

Hit, Stand, Double, Balance, Bet Size

Whenever a player loads up the blackjack game, they have the option to choose their 8-character client seed and bet amount. If no bet amount or client seed is picked, they will default to '7e6fc018' (A random hex string i generated) and 100 respectively.

When the player clicks the 'Deal' button, a check is made to see whether they are already playing. If not, the game state is reset.
Afterwards, a check is made whether the bet amount they picked is larger than their current balance, in which case the game will stop.
If everything checks out, 52 numbers will be generated in the range of 0-51, which creates the deck which will be used.
The player and dealer are dealt their cards, with the dealers second card being hidden. The values of the hands are also calculated and written on the page.
After the first 4 cards are dealt, checks are ran to see if a couple of situations have happened. These are:

Player or Dealer has 2 aces, in which case their score is reduced by 10, and the variable player/dealerConvertedAces is set to 1, and player/dealerAces is set to 0. This is to prevent issues with the Ace handling function that is used later.

Player or Dealer Blackjack.

Player has pair (If player has a pair they can split, currently redundant as Split function is not finished yet.)

If neither Player or Dealer has a Blackjack, the player is then offered the option to either Hit, Stay or Double.
If the Player clicks the 'Hit' button, a check is made to see whether it is the Players turn. If it is, a new card is given to the Player, and checks are ran to see whether the Player busts or has 21. If the Player busts, the Ace handling system is ran to see whether the Player truly busted, or if they can "use" an Ace to keep playing.
The Player can keep hitting untill they either get 21 or bust, or until they choose to stay.
If the Player chooses to Stand, the Dealers hidden card is revealed, and the game goes over to the Dealers turn.

If the Player chooses to Double, their bet amount is once again removed from their balance, and one card is given to them. This basically works like the process for hitting, with the difference being a doubled bet amount, and no possibility to hit again after Doubling. The Player can only double on their first 2 cards, thus doubling is not possible after hitting and vice versa.

When the Players turn is over, either as a result of them Doubling, or deciding to Stay on their cards, it's time for the Dealers turn.
The Dealer automatically hits untill they either bust, or their hand is worth over 17. If the Dealer busts, the same Ace handling system checks whether they really bust, or if an Ace can be "used".
If the Dealer busts, the Player gets 2x their bet amount back and the game is concluded.
If the Dealer gets somewhere over 17 and under 22, the Player and Dealer scores are compared to check whether the Player won, lost or tied, and the balance is updated accordingly.

The Ace handling system works by 2 internal variables keeping track of the total Aces, and the "converted" Aces (Aces which have been "used" to not bust). Every time an Ace is "used", the player/dealerconvertedAces is increased by 1, and resetting the variable counting the Aces in the hand. This system was a bit tricky to figure out, as a lot of solutions result in more than 1 Ace stopping the Player/Dealer from ever being able to bust.
