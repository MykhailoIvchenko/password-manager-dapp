import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Types "types";
import Helpers "helpers";

actor SecureStorage {
  stable var user_trie: Trie.Trie<Text, Types.User> = Trie.empty();

  public query ({ caller }) func get_user(username: Text) : async ?Types.User {
    let authenticated = Helpers.is_authenticated(caller);

    if (authenticated == false) return null;

    switch (Trie.get(user_trie, Helpers.key(username), Text.equal)) {
        case (?user) return ?user;
        case (_) return null;
    }
  };
};
