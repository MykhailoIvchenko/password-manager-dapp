import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Bool "mo:base/Bool";
import Error "mo:base/Error";
import Types "types";
import Helpers "helpers";

actor SecureStorage {
  stable var usernames: Trie.Trie<Text, Text> = Trie.empty();
  stable var users: Trie.Trie<Text, Types.User> = Trie.empty();

  func is_username_exists(username: Text): Bool {
    switch (Trie.get(usernames, Helpers.key(username), Text.equal)) {
        case (?username) return true;
        case (_) return false;
    }
  };

  public query ({ caller }) func get_user_by_id() : async ?Types.User {
    let authenticated = Helpers.is_authenticated(caller);

    if (authenticated == false) return null;

    let principal_id = Principal.toText(caller);

    switch (Trie.get(users, Helpers.key(principal_id), Text.equal)) {
        case (?user) return ?user;
        case (_) return null;
    }
  };

  public shared ({caller}) func register_user(username: Text, secret_key: Text) : async Types.User {
    var authenticated = Helpers.is_authenticated(caller);

    if (not authenticated) {
      throw Error.reject("Only authenticated users can register");
    };

    var is_valid_username = Helpers.validate_username(username);

    if (not is_valid_username) {
      throw Error.reject("Username is not valid. It should contain only alphanumeric symbols and have maximus size of 10 symbols");
    };

    var username_exists = is_username_exists(username);

    if (username_exists) {
      throw Error.reject("Username should be unique. And the username you've provided already exists");
    };
    
    let principal_id = Principal.toText(caller);

    let user_key : Trie.Key<Text> = Helpers.key(principal_id);

    let new_user: Types.User = { principal_id = principal_id; username = username; secret_key = secret_key };

    usernames := Trie.put(usernames, Helpers.key(username), Text.equal, username).0;

    users := Trie.put(users, user_key, Text.equal, new_user).0;

    return new_user;
  };

};
