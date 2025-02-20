// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NationBuilder {
    enum GameStatus {
        CREATED,
        PLAYER1_COMPLETED,
        PLAYER2_COMPLETED,
        READY,
        PROCESSING,
        READY_FOR_PROCESSING_ALLIANCE,
        COMPLETED_ALLIANCE_PROCESSING,
        COMPLETED
    }

    struct Decision {
        uint8 issueId;
        uint8 chosenOptionId;
    }

    struct NationStats {
        uint8 economicFreedom;
        uint8 civilRights;
        uint8 politicalFreedom;
        int256 gdp;
    }

    struct GameState {
        GameStatus status;
        address player1;
        address player2;
        bool player1Moved;
        bool player2Moved;
        NationStats player1Stats;
        NationStats player2Stats;
        uint256 lastUpdateTime;
        address winner;
        uint256 winningScore;
    }

    // State variables
    mapping(bytes32 => GameState) public games;
    mapping(bytes32 => mapping(address => Decision[])) public playerDecisions;
    mapping(address => bytes32[]) public playerGames;

    // Events
    event GameCreated(bytes32 indexed gameId, address indexed player1);
    event Player2Joined(bytes32 indexed gameId, address indexed player2);
    event DecisionsMade(bytes32 indexed gameId, address indexed player);
    event GameStatusUpdated(bytes32 indexed gameId, GameStatus newStatus);
    event WinnerDeclared(bytes32 indexed gameId, address indexed winner, uint256 score);

    // Modifiers
    modifier gameExists(bytes32 gameId) {
        require(games[gameId].player1 != address(0), "Game does not exist");
        _;
    }

    modifier onlyPlayers(bytes32 gameId) {
        require(
            msg.sender == games[gameId].player1 || msg.sender == games[gameId].player2,
            "Not a player in this game"
        );
        _;
    }

    function createGame(bytes32 gameId) external {
        require(games[gameId].player1 == address(0), "Game already exists");
        
        games[gameId].player1 = msg.sender;
        games[gameId].status = GameStatus.CREATED;
        games[gameId].lastUpdateTime = block.timestamp;
        playerGames[msg.sender].push(gameId);
        
        emit GameCreated(gameId, msg.sender);
        emit GameStatusUpdated(gameId, GameStatus.CREATED);
    }

    function joinGame(bytes32 gameId) external gameExists(gameId) {
        require(games[gameId].player1 != msg.sender, "Cannot join your own game");
        require(games[gameId].player2 == address(0), "Player 2 already joined");

        games[gameId].player2 = msg.sender;
        games[gameId].lastUpdateTime = block.timestamp;
        playerGames[msg.sender].push(gameId);

        emit Player2Joined(gameId, msg.sender);
    }

    // Modified to handle decisions one at a time
    function addDecision(
        bytes32 gameId,
        uint8 issueId,
        uint8 chosenOptionId
    ) external gameExists(gameId) onlyPlayers(gameId) {
        require(
            !games[gameId].player1Moved || !games[gameId].player2Moved,
            "All decisions submitted"
        );
        
        Decision memory decision = Decision({
            issueId: issueId,
            chosenOptionId: chosenOptionId
        });
        
        playerDecisions[gameId][msg.sender].push(decision);
    }

    // Submit final stats and complete turn
    function submitStats(
        bytes32 gameId,
        NationStats calldata stats
    ) external gameExists(gameId) onlyPlayers(gameId) {
        GameState storage game = games[gameId];
        
        if (msg.sender == game.player1) {
            require(!game.player1Moved, "Already made decisions");
            game.player1Stats = stats;
            game.player1Moved = true;
            game.status = GameStatus.PLAYER1_COMPLETED;
        } else {
            require(!game.player2Moved, "Already made decisions");
            game.player2Stats = stats;
            game.player2Moved = true;
            game.status = GameStatus.PLAYER2_COMPLETED;
        }

        game.lastUpdateTime = block.timestamp;
        emit DecisionsMade(gameId, msg.sender);
        emit GameStatusUpdated(gameId, game.status);

        if (game.player1Moved && game.player2Moved) {
            game.status = GameStatus.READY;
            emit GameStatusUpdated(gameId, GameStatus.READY);
        }
    }

    function updateGameStatus(bytes32 gameId, GameStatus newStatus) external {
        require(uint8(newStatus) > uint8(games[gameId].status), "Invalid status transition");
        
        games[gameId].status = newStatus;
        games[gameId].lastUpdateTime = block.timestamp;
        
        emit GameStatusUpdated(gameId, newStatus);
    }

    function setWinner(
        bytes32 gameId,
        address winner,
        uint256 score
    ) external {
        require(
            games[gameId].status == GameStatus.COMPLETED_ALLIANCE_PROCESSING,
            "Game not ready for winner declaration"
        );
        require(
            winner == games[gameId].player1 || winner == games[gameId].player2,
            "Invalid winner address"
        );

        GameState storage game = games[gameId];
        game.winner = winner;
        game.winningScore = score;
        game.status = GameStatus.COMPLETED;
        game.lastUpdateTime = block.timestamp;

        emit WinnerDeclared(gameId, winner, score);
        emit GameStatusUpdated(gameId, GameStatus.COMPLETED);
    }

    // Getters
    function getGameState(bytes32 gameId) external view 
        returns (
            GameStatus status,
            address player1,
            address player2,
            bool player1Moved,
            bool player2Moved,
            uint256 lastUpdateTime
        ) 
    {
        GameState storage game = games[gameId];
        return (
            game.status,
            game.player1,
            game.player2,
            game.player1Moved,
            game.player2Moved,
            game.lastUpdateTime
        );
    }

    function getPlayerStats(bytes32 gameId, bool isPlayer1) external view 
        returns (NationStats memory)
    {
        return isPlayer1 ? games[gameId].player1Stats : games[gameId].player2Stats;
    }

    function getPlayerDecisions(bytes32 gameId, address player) external view 
        returns (Decision[] memory)
    {
        return playerDecisions[gameId][player];
    }

    function getWinner(bytes32 gameId) external view 
        returns (
            address winner,
            uint256 winningScore,
            bool isGameCompleted
        ) 
    {
        GameState storage game = games[gameId];
        return (
            game.winner,
            game.winningScore,
            game.status == GameStatus.COMPLETED
        );
    }

    function getPlayerGames(address player) external view 
        returns (bytes32[] memory)
    {
        return playerGames[player];
    }
}