import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Types "types";
import Helpers "helpers";

actor SecureStorage {
  stable var user_trie: Trie.Trie<Text, Types.User> = Trie.empty();

  func get_user(username: Text) : async ?Types.User {
    switch (Trie.get(user_trie, Helpers.key username, Text.equal)) {
        case (?user) return ?user;
        case (_) return null;
    }
  };
};
