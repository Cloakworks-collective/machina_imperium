// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/NationBuilder.sol";

contract NationBuilderTest is Test {
    NationBuilder public game;
    address public player1;
    address public player2;
    bytes32 public gameId;

    event GameCreated(bytes32 indexed gameId, address indexed player1);
    event Player2Joined(bytes32 indexed gameId, address indexed player2);
    event DecisionsMade(bytes32 indexed gameId, address indexed player);
    event GameStatusUpdated(bytes32 indexed gameId, NationBuilder.GameStatus newStatus);
    event WinnerDeclared(bytes32 indexed gameId, address indexed winner, uint256 score);

    function setUp() public {
        game = new NationBuilder();
        player1 = makeAddr("player1");
        player2 = makeAddr("player2");
        vm.deal(player1, 100 ether);
        vm.deal(player2, 100 ether);
        gameId = keccak256(abi.encodePacked("testGame"));
    }

    function testCreateGame() public {
        vm.startPrank(player1);
        
        vm.expectEmit(true, true, false, true);
        emit GameCreated(gameId, player1);
        
        game.createGame(gameId);
        
        (
            NationBuilder.GameStatus status,
            address gamePlayer1,
            address gamePlayer2,
            bool player1Moved,
            bool player2Moved,
            uint256 lastUpdateTime
        ) = game.getGameState(gameId);
        
        assertEq(uint(status), uint(NationBuilder.GameStatus.CREATED));
        assertEq(gamePlayer1, player1);
        assertEq(gamePlayer2, address(0));
        assertEq(player1Moved, false);
        assertEq(player2Moved, false);
        assertEq(lastUpdateTime, block.timestamp);
        
        vm.stopPrank();
    }

    function testFullGameFlow() public {
        // Create game
        vm.prank(player1);
        game.createGame(gameId);
        
        // Player 2 joins
        vm.prank(player2);
        game.joinGame(gameId);
        
        // Player 1 makes decisions
        vm.startPrank(player1);
        game.addDecision(gameId, 1, 1);
        game.addDecision(gameId, 2, 2);
        
        NationBuilder.NationStats memory stats1 = NationBuilder.NationStats({
            economicFreedom: 75,
            civilRights: 80,
            politicalFreedom: 85,
            gdp: 5000
        });
        
        game.submitStats(gameId, stats1);
        vm.stopPrank();
        
        // Player 2 makes decisions
        vm.startPrank(player2);
        game.addDecision(gameId, 1, 2);
        game.addDecision(gameId, 2, 1);
        
        NationBuilder.NationStats memory stats2 = NationBuilder.NationStats({
            economicFreedom: 70,
            civilRights: 75,
            politicalFreedom: 80,
            gdp: 4500
        });
        
        game.submitStats(gameId, stats2);
        vm.stopPrank();
        
        // Verify game state
        (
            NationBuilder.GameStatus status,
            ,
            ,
            bool p1Moved,
            bool p2Moved,
        ) = game.getGameState(gameId);
        
        assertEq(uint(status), uint(NationBuilder.GameStatus.READY));
        assertTrue(p1Moved);
        assertTrue(p2Moved);
        
        // Verify decisions
        NationBuilder.Decision[] memory p1Decisions = game.getPlayerDecisions(gameId, player1);
        assertEq(p1Decisions.length, 2);
        assertEq(p1Decisions[0].issueId, 1);
        assertEq(p1Decisions[0].chosenOptionId, 1);
        
        // Verify stats
        NationBuilder.NationStats memory p1Stats = game.getPlayerStats(gameId, true);
        assertEq(p1Stats.economicFreedom, 75);
        assertEq(p1Stats.gdp, 5000);
    }

    function testCannotMakeInvalidMoves() public {
        vm.prank(player1);
        game.createGame(gameId);
        
        vm.prank(player2);
        game.joinGame(gameId);
        
        // Try to submit stats before decisions
        vm.startPrank(player1);
        NationBuilder.NationStats memory stats = NationBuilder.NationStats({
            economicFreedom: 75,
            civilRights: 80,
            politicalFreedom: 85,
            gdp: 5000
        });
        
        game.submitStats(gameId, stats);
        
        // Try to submit stats again
        vm.expectRevert("Already made decisions");
        game.submitStats(gameId, stats);
        
        vm.stopPrank();
    }

    function testFuzz_Decisions(
        uint8 issueId,
        uint8 chosenOptionId,
        uint8 economicFreedom,
        uint8 civilRights,
        uint8 politicalFreedom,
        int256 gdp
    ) public {
        vm.assume(economicFreedom <= 100);
        vm.assume(civilRights <= 100);
        vm.assume(politicalFreedom <= 100);
        
        vm.prank(player1);
        game.createGame(gameId);
        
        vm.startPrank(player1);
        game.addDecision(gameId, issueId, chosenOptionId);
        
        NationBuilder.NationStats memory stats = NationBuilder.NationStats({
            economicFreedom: economicFreedom,
            civilRights: civilRights,
            politicalFreedom: politicalFreedom,
            gdp: gdp
        });
        
        game.submitStats(gameId, stats);
        
        NationBuilder.NationStats memory storedStats = game.getPlayerStats(gameId, true);
        assertEq(storedStats.economicFreedom, economicFreedom);
        assertEq(storedStats.civilRights, civilRights);
        assertEq(storedStats.politicalFreedom, politicalFreedom);
        assertEq(storedStats.gdp, gdp);
        
        vm.stopPrank();
    }
}