import { Chess } from 'chess.js'


function isWin(board, callback) {
    if (board.isCheckmate()) callback(true, "checkmate")
    if (board.isDraw()) callback(true, "draw")
    if (board.isStalemate()) callback(true, "stalemate")
}

export default { isWin };